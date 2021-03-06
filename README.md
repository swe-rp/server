## Setup on Azure

Sudo is required to actually listen on port 80/443.

Or `sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 3000`.

But the latter has the problem of not being able access the key.

## Usage

`node -r dotenv/config index.js`

We preload our dotenv so we can use it everywhere.

## Environment Variables

```shell
FB_CLIENT_ID=
FB_CLIENT_SECRET=
MONGO_URL=
SSL_KEY_PATH=
SSL_CERT_PATH=
JWT_SECRET=
```

## Firebase Cloud Messaging

We need a `ServiceAccountKey.json` in `firebase/` in order to connect with Firebase for our notifications.
