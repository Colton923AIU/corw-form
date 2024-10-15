import { SPHttpClient } from '@microsoft/sp-http';

type TgetUserIdByemail = {
  spHttpClient: SPHttpClient;
  email: string;
  url: string;
};

const getUserIdByemail = async ({
  spHttpClient,
  email,
  url,
}: TgetUserIdByemail) => {
  const basePath = new URL(url).origin;
  const subsites = url.split('Lists')[0].split('com')[1];

  const userUrl =
    basePath + subsites + `/_api/web/siteusers?$filter=Email eq '${email}'`;
  console.log('userUrl: ', userUrl);

  const response = await spHttpClient.get(
    userUrl,
    SPHttpClient.configurations.v1
  );

  if (!response.ok) {
    throw new Error('Error fetching user: ' + response.statusText);
  }

  const data = await response.json();
  const user = data.value[0];
  return {
    Id: parseInt(user.Id),
    Title: user.Title,
    Email: user.Email,
  };
};

export default getUserIdByemail;
