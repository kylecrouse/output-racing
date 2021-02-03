import { ApiClient } from 'twitch';
import { StaticAuthProvider } from 'twitch-auth';
import { getSecretValue } from '../lib/secrets';

(async () => {
  try {
    console.log(111);
    const { clientId, clientSecret } = await getSecretValue('ORLBot/Twitch');
    console.log(222);
    const authProvider = new StaticAuthProvider(clientId, clientSecret);
    const apiClient = new ApiClient({ authProvider });
    
    console.log(await isStreamLive('aussie_sim_commentator'));
  } catch(err) {
    console.error(err);  
  }
  
  async function isStreamLive(userName) {
  	const user = await apiClient.helix.users.getUserByName(userName);
  	if (!user) 
  		return false;
  	return await user.getStream() !== null;
  }
})()
