/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

// Object with environment variables from the .env file (see frontend/app/config/.env.template)
// The .env file will automatically created inside gitlab build process.
declare const buildEnvironments: { [key: string]: string };
