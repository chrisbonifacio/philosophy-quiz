# Philosophy Quiz

A real-time philosophy quiz game built with Next.js, AWS Amplify, and React. Challenge your philosophical knowledge against other players in this interactive quiz application.

## Features

- **User Authentication**: Secure login and registration with AWS Amplify
- **Real-time Matchmaking**: Find opponents and play live quiz games
- **Philosophy Questions**: Diverse categories and difficulty levels
- **Admin Dashboard**: Manage questions and view game sessions
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: AWS Amplify (Authentication, API, DataStore)
- **Styling**: Tailwind CSS with custom components
- **Icons**: React Icons library
- **TypeScript**: Type-safe code throughout the application

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn package manager
- AWS account (for Amplify backend)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd philosophy-quiz
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up Amplify (if not already configured):

```bash
npm install -g @aws-amplify/cli
amplify configure
amplify init
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `/app` - Next.js app router pages and layouts
- `/src/components` - Reusable React components
- `/src/contexts` - React context providers
- `/src/utils` - Utility functions and helpers
- `/src/lib` - Library code and API clients
- `/public` - Static assets

## Admin Access

To access the admin features:
1. Log in with an admin account
2. Navigate to `/admin/questions` to manage quiz questions
3. Navigate to `/admin/sessions` to view game sessions

## Using Icons

This project uses [React Icons](https://react-icons.github.io/react-icons/) for icons. To use icons in your components:

1. Import icons from their respective collections:
```jsx
import { FaPhilosophyIcon } from 'react-icons/fa'; // Font Awesome
import { IoMdTimer } from 'react-icons/io';        // Ionicons
import { BsFillQuestionCircleFill } from 'react-icons/bs'; // Bootstrap
```

2. Use them in your components:
```jsx
<FaPhilosophyIcon size={24} className="text-blue-600" />
```

Browse available icons at: https://react-icons.github.io/react-icons/

## Deployment

The application can be deployed using AWS Amplify Hosting:

```bash
amplify publish
```

For more details on deployment options, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
