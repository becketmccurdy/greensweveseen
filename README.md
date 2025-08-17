# GreenSWEveSeen

A web application for tracking golf rounds and course statistics, built with React, TypeScript, and Supabase.

## Features

- User authentication (login, register, password reset)
- Email verification
- Profile management with avatar upload
- Track golf rounds with course details
- View golf round history and statistics
- Protected routes for authenticated users
- Responsive design with Chakra UI
- Error handling and loading states

## Prerequisites

- Node.js 14+ and npm
- Supabase account and project

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under API settings.

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Database Setup

1. Create a new Supabase project
2. Enable email authentication in Auth settings
3. Create the following tables:

```sql
create table golf_rounds (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  course_name text not null,
  date date not null,
  score integer not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table golf_rounds enable row level security;

-- Create policies
create policy "Users can view their own rounds"
  on golf_rounds for select
  using (auth.uid() = user_id);

create policy "Users can insert their own rounds"
  on golf_rounds for insert
  with check (auth.uid() = user_id);
```

4. Create a storage bucket named 'avatars' for profile pictures

## Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy to your hosting provider of choice (e.g., Netlify, Vercel)
3. Set environment variables in your hosting provider's dashboard

## Development

Runs the app in development mode:
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
