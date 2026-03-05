# Version Management System

This project includes an automatic version management system that increments the build number every time you run the build command.

## How It Works

1. **Version File**: `version.json` stores the current version information:
   - `version`: Semantic version (e.g., "3.0.0")
   - `buildNumber`: Auto-incrementing build number
   - `buildDate`: ISO timestamp of the last build

2. **Build Script**: `increment-version.js` runs automatically before each build via the `prebuild` npm script

3. **Version Service**: `src/app/services/version.service.ts` provides access to version info in the application

4. **Display**: Version is shown on the login screen

## Usage

### Building the Application
```bash
npm run build
```
This will automatically:
- Increment the build number
- Update the build date
- Copy version.json to assets folder
- Build the application

### Updating the Version Number
To update the major/minor/patch version, manually edit `version.json`:
```json
{
  "version": "3.1.0",  // Update this
  "buildNumber": 42,
  "buildDate": "..."
}
```

### Accessing Version in Code
```typescript
import { VersionService } from 'src/app/services/version.service';

constructor(private versionService: VersionService) {}

ngOnInit() {
  this.versionService.getVersion().subscribe(info => {
    console.log(`Version: v${info.version} (Build #${info.buildNumber})`);
  });
}
```

## Files

- `version.json` - Root version file (auto-generated, gitignored)
- `src/assets/version.json` - Runtime version file (auto-generated, gitignored)
- `increment-version.js` - Version increment script
- `src/app/services/version.service.ts` - Angular service for version access

## Notes

- Version files are gitignored to avoid merge conflicts
- Build number resets when version.json is recreated
- For production, consider tagging releases in git to track versions
