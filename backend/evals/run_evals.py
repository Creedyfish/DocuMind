import json
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent))
import anthropic
from anthropic.types import TextBlock
from config import settings
from services.query import ask

TEST_CASES_PATH = Path(__file__).parent / "test_cases.json"

# Replace this with the session_id from your browser's sessionStorage after uploading the PDF
SESSION_ID = "b26789d2-25ee-4706-9f62-662f8a2d33d6"

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)


def score_answer(question: str, expected: str, actual: str) -> float:
    """Ask Claude Haiku to score how well the actual answer matches expected."""
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=10,
        messages=[
            {
                "role": "user",
                "content": f"""You are an evaluator scoring AI-generated answers.

Question: {question}

Expected answer: {expected}

Actual answer: {actual}

Score the actual answer from 0.0 to 1.0 based on how well it captures the key facts in the expected answer.
- 1.0 = all key facts present and accurate
- 0.7 = most key facts present, minor omissions
- 0.5 = some key facts present but significant gaps
- 0.2 = barely relevant
- 0.0 = completely wrong or missing

Respond with ONLY a number between 0.0 and 1.0. Nothing else.""",
            }
        ],
    )

    for block in response.content:
        if isinstance(block, TextBlock):
            try:
                return max(0.0, min(1.0, float(block.text.strip())))
            except ValueError:
                return 0.0
    return 0.0


def run_evals():
    if SESSION_ID == "YOUR_SESSION_ID_HERE":
        print("❌ Please set SESSION_ID in run_evals.py before running.")
        print(
            "   Upload the Berkshire PDF via your app, then copy the session_id from sessionStorage."
        )
        sys.exit(1)

    with open(TEST_CASES_PATH) as f:
        test_cases = json.load(f)

    print(f"🧪 Running {len(test_cases)} eval cases...")
    print(f"   Session ID: {SESSION_ID}\n")
    print("=" * 60)

    scores = []
    results = []

    for i, case in enumerate(test_cases, 1):
        question = case["question"]
        expected = case["expected"]

        print(f"[{i}/{len(test_cases)}] {question}")

        try:
            # Call your actual pipeline — same as the chat endpoint
            actual = ask(question=question, session_id=SESSION_ID, history=[])

            score = score_answer(question, expected, actual)
            scores.append(score)
            results.append(
                {
                    "question": question,
                    "expected": expected,
                    "actual": actual,
                    "score": score,
                }
            )

            status = "✅" if score >= 0.7 else "⚠️" if score >= 0.4 else "❌"
            print(f"  {status} Score: {score:.1f}")
            print(f"  Expected: {expected[:120]}...")
            print(f"  Actual:   {actual[:120]}...")

        except Exception as e:
            print(f"  ❌ Error: {e}")
            scores.append(0.0)
            results.append(
                {
                    "question": question,
                    "expected": expected,
                    "actual": f"ERROR: {e}",
                    "score": 0.0,
                }
            )

        print()

    # Summary
    avg_score = sum(scores) / len(scores) if scores else 0
    passed = sum(1 for s in scores if s >= 0.7)
    total = len(scores)

    print("=" * 60)
    print("📊 EVAL RESULTS")
    print(f"   Passed (≥0.7): {passed}/{total}")
    print(f"   Average score: {avg_score:.2f}")
    print(
        f"   Overall grade: {'🟢 GOOD' if avg_score >= 0.7 else '🟡 OK' if avg_score >= 0.5 else '🔴 NEEDS WORK'}"
    )
    print("=" * 60)

    # Save full results
    output_path = Path(__file__).parent / "eval_results.json"
    with open(output_path, "w") as f:
        json.dump(
            {
                "session_id": SESSION_ID,
                "summary": {
                    "passed": passed,
                    "total": total,
                    "avg_score": round(avg_score, 2),
                },
                "results": results,
            },
            f,
            indent=2,
        )

    print("\n💾 Full results saved to evals/eval_results.json")


if __name__ == "__main__":
    run_evals()
