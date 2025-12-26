# Fix "Invalid App Registration" Error

Your Azure Manifest confirms that the **Xbox Live** permission is missing. Even though we request it in the code, Azure requires it to be explicitly added to the "API Permissions" list for the `api.minecraftservices.com` backend to accept the token.

## Steps to Fix

1.  Go to the [Azure Portal > App Registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade).
2.  Select your app **"CraftCrops Launcher"**.
3.  In the left menu, click **API Permissions**.
4.  Click **+ Add a permission**.
5.  Select the **APIs my organization uses** tab.
6.  In the search box, type `Xbox` and select **"Xbox Live"** (sometimes shown as `XBL`).
7.  Click **Delegated permissions**.
8.  Check the box for **`XboxLive.signin`**.
9.  Click **Add permissions**.

## Critical Step: Grant Admin Consent
*(Only if you are using an arbitrary tenant, but acceptable for personal use too)*
10. If you see a warning or if you are the admin, click the **"Grant admin consent for [Your Org]"** button next to the "Add a permission" button.
11. Confirm the dialog.

## Update Manifest (Optional but recommended)
If you prefer editing the Manifest JSON directly, add this block to your `requiredResourceAccess` array:

```json
		{
			"resourceAppId": "000000004C495645-0000-0000-0000-000000000000",
			"resourceAccess": [
				{
					"id": "DE305D54-75D4-431D-8960-2645652613CE",
					"type": "Scope"
				}
			]
		}
```

After doing this, **wait 1-2 minutes** for the changes to propagate, then restart the launcher and try again.
