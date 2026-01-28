# domain-port-forwarding
Curl request example
```bash
curl https://gpt.useprivate.ai/v1/chat/completions   -H "Authorization: Bearer API_TOKEN"   -H "Content-Type: application/json"   -N   -d '{
    "model": "openai/gpt-oss-120b",
    "messages": [
      { "role": "user", "content": "Write a haiku about microservices." }
    ],
  }'
```
