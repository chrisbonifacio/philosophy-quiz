import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Checks if the current user has admin privileges by verifying their Cognito groups
 * @returns Promise<boolean> indicating if user has admin access
 */
export async function isUserAdmin(): Promise<boolean> {
    try {
        const { tokens } = await fetchAuthSession();

        if (!tokens) {
            return false;
        }

        const groups = tokens.accessToken.payload['cognito:groups'] || [];
        return Array.isArray(groups) && groups.includes('Admin');
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}
