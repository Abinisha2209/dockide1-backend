import importlib.util
import json
import sys

def run_tests():
    with open('/workspace/testcases.json') as f:
        testcases = json.load(f)
    spec = importlib.util.spec_from_file_location("solution", "/workspace/solution.py")
    solution = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(solution)
    results = []
    for case in testcases:
        try:
            output = solution.solve()
            passed = output == case['expected']
            results.append({'input': case.get('input'), 'expected': case['expected'], 'output': output, 'passed': passed})
        except Exception as e:
            results.append({'input': case.get('input'), 'expected': case['expected'], 'output': str(e), 'passed': False})
    print(json.dumps(results))

if __name__ == "__main__":
    run_tests()
