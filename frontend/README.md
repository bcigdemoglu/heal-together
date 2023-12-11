# Frontend for Heal Together

# Critical Links

- App: https://fantastic-parfait-6db553.netlify.app
- FE at Netlify: https://app.netlify.com/sites/fantastic-parfait-6db553/overview
- CSS: tailwind.config.ts

# Testing on locahost mobile device:

```
yarn; yarn build; yarn dev
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print "http://"$2":3000"}'
# Access the link on mobile device
```
