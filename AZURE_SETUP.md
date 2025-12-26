# Azure App Setup Guide for Microsoft Login

Follow this guide to set up your own Azure Application for Microsoft Authentication (Xbox Live/Minecraft).

## 1. Register a new Application in Azure Portal

1.  Go to the [Azure Portal](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade) -> **App registrations**.
2.  Click **New registration**.
3.  **Name**: Enter a name for your application (e.g., "CraftCorps Launcher").
4.  **Supported account types**: Select **Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)**.
    *   *Note: This is crucial for allowing personal Xbox accounts to sign in.*
5.  **Redirect URI (optional)**:
    *   Select platform: **Public client/native (mobile & desktop)**.
    *   Enter URI: `https://login.live.com/oauth20_desktop.srf`
6.  Click **Register**.

## 2. Configure Authentication

1.  In your new app's menu sidebar, go to **Authentication**.
2.  Ensure that under **Advanced settings** -> **Allow public client flows**, the toggle for "Enable the following mobile and desktop flows" is set to **Yes**.
3.  Click **Save** at the top.

## 3. Get your Client ID

1.  Go to the **Overview** blade of your application.
2.  Copy the **Application (client) ID**. It should look like a UUID (e.g., `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6`).

## 4. Integrate into Code

1.  Open the file `electron/microsoftAuth.cjs` in your project.
2.  Locate the `CLIENT_ID` constant near the top of the file.
3.  Replace the existing ID with your new **Application (client) ID**.

```javascript
// electron/microsoftAuth.cjs

// REPLACE THIS
const CLIENT_ID = "00000000-402b-9153-0000-000000000000"; 

// WITH YOUR ID
const CLIENT_ID = "your-copied-client-id-here";
```

4.  Save the file.

## 5. Verify Permissions (Optional)
This launcher uses the default Xbox Scopes (`XboxLive.signin` and `offline_access`). No additional API permissions usually need to be manually configured in Azure for this basic login flow, as the prompt will ask the user for consent dynamically.

## Troubleshooting

*   **Social Engineering Error**: If you see an error about the app not being verified, this is common for new unverified apps. You can usually proceed by clicking "Advanced" -> "Continue to (App Name) (unsafe)".
*   **Redirect Loop**: Ensure the Redirect URI in Azure matches exactly `https://login.live.com/oauth20_desktop.srf`.

You are now ready to build and run your launcher with your own Microsoft Login identity!

### "Invalid app registration" Error (Mojang Restriction)

If you receive the error `Invalid app registration` (or code `AUTH_INVALID_APP_CONFIG`) when logging in, it means **Mojang's API has blocked your new Azure Application Client ID**.

This is a known restriction for new third-party launchers. You have two options:

1.  **Request Approval**: Visit [aka.ms/AppRegInfo](https://aka.ms/AppRegInfo) and submit your Azure App ID for approval by Mojang/Microsoft. This process can take time.
2.  **Development Testing**: To verify your code is working while waiting for approval, you can temporarily use a known public Client ID from an open-source launcher (like Prism Launcher) in `electron/microsoftAuth.cjs`.
    *   *Warning: Do not release your application with another project's Client ID.*
