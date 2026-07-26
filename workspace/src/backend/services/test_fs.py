import time
import hmac
import hashlib
import urllib.parse
import base64
import uuid
import httpx

CLIENT_ID = "f1e724daaac440e8aca2de243e60529a"
CLIENT_SECRET = "4ffd46a34f744c0db81b19e31afdd7d5"

def test_oauth1():
    url = "https://platform.fatsecret.com/rest/server.api"
    params = {
        "method": "foods.search",
        "search_expression": "apple",
        "format": "json",
        "oauth_consumer_key": CLIENT_ID,
        "oauth_nonce": str(uuid.uuid4()),
        "oauth_signature_method": "HMAC-SHA1",
        "oauth_timestamp": str(int(time.time())),
        "oauth_version": "1.0"
    }

    # Sort parameters
    sorted_params = sorted(params.items())
    param_str = "&".join([f"{urllib.parse.quote(k, safe='')}={urllib.parse.quote(v, safe='')}" for k, v in sorted_params])
    
    base_str = "GET&" + urllib.parse.quote(url, safe='') + "&" + urllib.parse.quote(param_str, safe='')
    signing_key = (CLIENT_SECRET + "&").encode()
    
    hashed = hmac.new(signing_key, base_str.encode(), hashlib.sha1)
    sig = base64.b64encode(hashed.digest()).decode()
    
    params["oauth_signature"] = sig
    
    resp = httpx.get(url, params=params)
    print("OAuth 1.0a Status:", resp.status_code)
    print("OAuth 1.0a Response:", resp.json())

if __name__ == "__main__":
    test_oauth1()
