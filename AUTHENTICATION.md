# ePortal Authentication Implementation

## Overview
This implementation handles authentication via eFaaS (ePortal Federated Authentication as a Service) tokens. When users are redirected from the eFaaS service, the application validates their token and exchanges it for an access token.

## Architecture

### Files Created

1. **Environment Configuration**
   - `src/environments/environment.ts` - Production environment settings
   - `src/environments/environment.development.ts` - Development environment settings
   - Contains API base URL: `https://e-portal-api-dev-01.mwsc.com.mv`

2. **Authentication Service** (`src/app/services/auth.service.ts`)
   - Handles token validation with the eFaaS endpoint
   - Stores authentication data (access token, refresh token, user data)
   - Provides methods to check authentication status
   - Manages logout functionality

3. **HTTP Interceptor** (`src/app/interceptors/auth.interceptor.ts`)
   - Automatically adds Bearer token to all HTTP requests (except the auth endpoint)
   - Handles 401 errors by clearing auth data and redirecting to login

4. **Connect Component** (`src/app/pages/authentication/connect/`)
   - Handles the callback URL: `/connect?eportal_efaas_idtoken=...`
   - Extracts the eFaaS token from URL parameters
   - Calls the auth service to validate the token
   - Redirects to dashboard on success or login on failure

5. **Auth Guard** (`src/app/guards/auth.guard.ts`)
   - Protects routes that require authentication
   - Redirects unauthenticated users to login

## Authentication Flow

1. User is redirected from eFaaS service to: 
   ```
   http://localhost:4200/connect?eportal_efaas_idtoken=<token>
   ```

2. The `ConnectComponent` extracts the `eportal_efaas_idtoken` from URL parameters

3. The token is sent to the validation endpoint via `AuthService.validateEfaasToken()`:
   ```
   POST https://e-portal-api-dev-01.mwsc.com.mv/api/v1/auth/efaas
   Content-Type: multipart/form-data
   
   Fields:
   - token: <eportal_efaas_idtoken>
   - device: eportal
   - client: ePortal
   ```

4. On successful validation, the response contains:
   - `access_token` - Used for subsequent API calls
   - `refresh_token` - Used to refresh the access token
   - User profile information

5. The auth service stores the tokens and user data in `localStorage`

6. All subsequent HTTP requests automatically include the access token via the `AuthInterceptor`

7. If a 401 error occurs, the interceptor clears auth data and redirects to login

## Usage

### Protecting Routes
To protect a route, add the `authGuard` to your route definition:

```typescript
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'protected',
    component: ProtectedComponent,
    canActivate: [authGuard]
  }
];
```

### Accessing User Data
In your components or services, inject `AuthService` to access user information:

```typescript
import { AuthService } from './services/auth.service';

export class MyComponent {
  private authService = inject(AuthService);

  ngOnInit() {
    const userData = this.authService.getUserData();
    console.log('User:', userData);
    
    // Check authentication status
    if (this.authService.isAuthenticated()) {
      // User is logged in
    }
  }
}
```

### Logout
To logout a user:

```typescript
this.authService.logout();
```

## API Response Structure

The authentication endpoint returns the following structure:

```typescript
{
  access_token: string;           // Bearer token for API calls
  token_type: string;             // "bearer"
  expires_in: number;             // Token expiry in seconds
  refresh_token: string;          // Refresh token
  'as:client_id': string;         // "Website"
  'as:device': string;            // "eportal"
  userName: string;               // User's email
  Name: string;                   // Full name
  Email: string;                  // Email address
  userType: string;               // "STANDARD" or other
  is_premium_subscription: string; // "True" or "False"
  is_efaas: string;               // "True" or "False"
  phone_number: string;
  idnumber: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  nationality: string;
  // ... and more fields
}
```

## Testing

To test the authentication flow:

1. Start your development server
2. Navigate to: `http://localhost:4200/connect?eportal_efaas_idtoken=<valid_token>`
3. The app should validate the token and redirect to the dashboard
4. Check the browser's localStorage to see stored tokens and user data

## Security Considerations

- Tokens are stored in `localStorage` (consider using `httpOnly` cookies for production)
- Access token expiry is tracked and validated before use
- The interceptor automatically handles 401 errors
- The auth endpoint is excluded from the interceptor to prevent circular requests

## Next Steps

Consider implementing:
- Token refresh mechanism using the refresh token
- Secure storage (httpOnly cookies or encrypted storage)
- Session timeout warnings
- Remember me functionality
- Multi-factor authentication support
