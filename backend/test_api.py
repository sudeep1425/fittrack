import json
import random
import urllib.request

base_url = 'http://127.0.0.1:5000/api'

email = f'testuser{random.randint(10000,99999)}@example.com'
print('Registering', email)

register_data = json.dumps({
    'name': 'Test User',
    'email': email,
    'password': 'Test1234'
}).encode('utf-8')

req = urllib.request.Request(
    f'{base_url}/register',
    data=register_data,
    headers={'Content-Type': 'application/json'},
    method='POST'
)
with urllib.request.urlopen(req, timeout=10) as resp:
    body = json.loads(resp.read().decode())
    print('Register response:')
    print(json.dumps(body, indent=2))

user_id = body['user']['_id']
token = body['token']

req2 = urllib.request.Request(
    f'{base_url}/dashboard/{user_id}',
    headers={'Authorization': f'Bearer {token}'},
    method='GET'
)
with urllib.request.urlopen(req2, timeout=10) as resp2:
    body2 = json.loads(resp2.read().decode())
    print('Dashboard response:')
    print(json.dumps(body2, indent=2))
