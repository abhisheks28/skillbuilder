import requests
import json

def test_api():
    base_url = "http://localhost:8000/api/question-book"
    
    print("Testing /grade1/all...")
    try:
        response = requests.get(f"{base_url}/grade1/all?count=2")
        if response.status_code == 200:
            data = response.json()
            print(f"Success! Received {len(data)} topics.")
            # print(json.dumps(data, indent=2, ensure_ascii=False))
        else:
            print(f"Failed with status code: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error: {e}")

    print("\nTesting /grade1/topic...")
    try:
        topic = "Number Sense / Counting Forwards"
        response = requests.get(f"{base_url}/grade1/topic?topic={topic}&count=3")
        if response.status_code == 200:
            data = response.json()
            print(f"Success! Received {len(data)} questions for topic '{topic}'.")
            # print(json.dumps(data, indent=2, ensure_ascii=False))
        else:
            print(f"Failed with status code: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
