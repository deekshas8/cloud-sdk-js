---
'@sap-cloud-sdk/connectivity': patch
---

[Fixed Issue] Fix the `The proxy configuration is undefined` error for OnPrem `MAIL` destinations by removing the `isHttpDestination` check when adding proxyConfiguration to the destination object.