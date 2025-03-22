import { Amplify } from 'aws-amplify';
import amplifyConfig from '../../amplify_outputs.json';

export const configureAmplify = () => {
    Amplify.configure(amplifyConfig);
};