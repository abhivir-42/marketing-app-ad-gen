import requests
if __name__ == "__main__":
    body = {
        'script': [
            {
                'line': "Ew, that apple is so rotten how did you even go near it.",
                'artDirection': "A young woman with a high pitched voice speaks slowly and filled with disgust in a confined space. Her voice is very expressive and there is minimal noise."
            },
            {
                'line': "How dare you speak to me like that, I am your father!",
                'artDirection': "A fifty year old man with a deep and powerful voice speaks slowly and very angrily to his son. His voice is very expressive and there is minimal noise."
            }
        ]
    }
    r = requests.post("http://0.0.0.0:8001/generate_audio", json=body)
    print(r.status_code)
    print(r.json())