# Browser Compatibility Guide for DOB Validator

## Overview

The DOB Validator uses the **Bigger Simple Signer** (`https://sign.bigger.systems`) for Stellar wallet connections. This is a trusted, secure wallet connector that operates in a separate window for enhanced security.

## ⚠️ Common Browser Blocking Issues

### Why Browsers Block Wallet Connections

Browser blocking of wallet connectors is **normal and expected behavior** for security reasons:

1. **Popup Blockers**: Modern browsers block popups by default
2. **Cross-Origin Restrictions**: The Simple Signer runs on a different domain
3. **Security Policies**: Browsers restrict external wallet connectors
4. **Privacy Settings**: Enhanced privacy modes block external connections
5. **Extension Interference**: Security extensions may block wallet connections

### Affected Browsers

- **Brave Browser**: Most aggressive blocking (privacy-focused)
- **Chrome/Edge**: Moderate blocking with user controls
- **Firefox**: Moderate blocking with enhanced tracking protection
- **Safari**: Strict popup blocking by default
- **Mobile Browsers**: Often block popups entirely

## 🔧 How to Resolve Connection Issues

### 1. Allow Popups for This Site

**Quick Fix:**

1. Look for the popup blocker icon in your browser's address bar
2. Click it and select "Always allow popups" for `validator.dobprotocol.com`

### 2. Browser-Specific Solutions

#### Chrome/Edge

1. Click the shield icon in the address bar
2. Select "Site settings"
3. Find "Popups and redirects"
4. Change from "Block" to "Allow"
5. Refresh the page

#### Firefox

1. Click the shield icon in the address bar
2. Select "Enhanced Tracking Protection"
3. Click "Site Permissions"
4. Find "Pop-ups" and change to "Allow"
5. Refresh the page

#### Brave Browser

1. Click the shield icon in the address bar
2. Select "Site and Shield settings"
3. Find "Pop-ups" and change to "Allow"
4. Refresh the page

#### Safari

1. Go to Safari → Preferences → Websites
2. Select "Pop-up Windows" from the left sidebar
3. Find `validator.dobprotocol.com` in the list
4. Change from "Block" to "Allow"
5. Refresh the page

### 3. Alternative Solutions

#### Use a Different Browser

If issues persist, try:

- **Chrome** with default settings
- **Firefox** with default settings
- **Edge** with default settings

#### Disable Extensions Temporarily

1. Disable ad blockers, privacy extensions, or security extensions
2. Try connecting your wallet
3. Re-enable extensions after successful connection

#### Use Incognito/Private Mode

Some browsers have fewer restrictions in private browsing mode.

## 🛡️ Security Information

### About the Simple Signer

- **Domain**: `https://sign.bigger.systems`
- **Purpose**: Secure Stellar wallet connection and transaction signing
- **Security**: Operates in isolated window for enhanced security
- **Trust**: Widely used in the Stellar ecosystem

### Why We Use It

1. **Security**: Isolated environment for wallet operations
2. **Compatibility**: Works with all major Stellar wallets
3. **Reliability**: Proven technology in the Stellar ecosystem
4. **No Installation**: No browser extension required

## 📱 Mobile Considerations

### Mobile Browser Limitations

Most mobile browsers have strict popup blocking that cannot be disabled:

- **iOS Safari**: Blocks most popups
- **Chrome Mobile**: Blocks popups by default
- **Firefox Mobile**: Blocks popups by default

### Mobile Solutions

1. **Use Desktop Mode**: Switch to desktop view in mobile browser
2. **Use Different Browser**: Try Firefox Focus or Brave Mobile
3. **Use Desktop**: Connect wallet on desktop computer

## 🚨 Troubleshooting

### Common Error Messages

| Error                                 | Cause               | Solution                   |
| ------------------------------------- | ------------------- | -------------------------- |
| "Failed to open Simple Signer window" | Popup blocked       | Allow popups for this site |
| "Connection timeout"                  | Network issues      | Check internet connection  |
| "Wallet not found"                    | No wallet installed | Install a Stellar wallet   |
| "Authentication failed"               | Signature issues    | Try reconnecting wallet    |

### Debug Steps

1. **Check Console**: Open browser developer tools (F12) and check for errors
2. **Clear Cache**: Clear browser cache and cookies
3. **Try Incognito**: Test in private browsing mode
4. **Check Network**: Ensure stable internet connection
5. **Update Browser**: Use the latest browser version

## 📞 Support

### Getting Help

If you continue to experience issues:

1. **Check FAQ**: Visit our [FAQ page](https://wiki.dobprotocol.com)
2. **Contact Support**: Reach out via [Telegram](https://t.me/andresanemic)
3. **Browser Info**: Include your browser version and operating system
4. **Error Details**: Provide any error messages from the browser console

### Alternative Connection Methods

If browser blocking persists, we're working on alternative connection methods:

- **Direct wallet integration** (coming soon)
- **QR code connection** (coming soon)
- **Mobile app integration** (coming soon)

## 🔄 Updates

This guide will be updated as:

- New browser versions are released
- Alternative connection methods become available
- User feedback identifies new solutions

---

**Note**: Browser blocking is a security feature, not a bug. These measures protect users from malicious popups and unauthorized connections. Our wallet connector is designed with security in mind and operates within these constraints.
