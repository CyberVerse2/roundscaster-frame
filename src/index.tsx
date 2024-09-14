import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Button, Frog, TextInput } from 'frog';
import { devtools } from 'frog/dev';
// import { neynar } from 'frog/hubs'

export const app = new Frog({
  // Supply a Hub to enable frame verification.
  title: 'Roundscaster'
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
});

app.use('/*', serveStatic({ root: './public' }));

app.frame('/', (c) => {
  return c.res({
    action: '/stats',
    image: 'https://res.cloudinary.com/dbuaprzc0/image/upload/f_auto,q_auto/bl6vq4pvhmzsa8jjjrbd',
    intents: [
      <TextInput placeholder="Enter Farcaster ID" />,
      <Button value="search">Reveal Stats</Button>
    ]
  });
});

app.frame('/stats', async (c) => {
  const { inputText } = c;
  const farcasterId = inputText;

  try {
    const response = await fetch(
      `https://rounds-checker.adaptable.app/api/v1/rounds/user?userId=${farcasterId}`
    );
    const data = await response.json();

    const totalEarnings = data.totalEarnings.reduce(
      (acc, earning) => acc + `${earning.denomination}: ${earning.amount.toFixed(2)}\n`,
      ''
    );

    const recentWinnings = data.winnings.slice(0, 2);

    return c.res({
      image: (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0a1528',
            width: '100%',
            height: '100%',
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
            color: 'white'
          }}
        >
          <h1
            style={{
              color: '#FFD700',
              fontSize: '24px',
              marginBottom: '20px',
              textAlign: 'center'
            }}
          >
            Farcaster ID: {farcasterId}
          </h1>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '10px',
                padding: '15px',
                width: '48%'
              }}
            >
              <h2
                style={{
                  color: '#4CAF50',
                  fontSize: '18px',
                  marginBottom: '10px'
                }}
              >
                Rounds Participated
              </h2>
              <p
                style={{
                  fontSize: '28px',
                  textAlign: 'center'
                }}
              >
                {data.roundsParticipated.length}
              </p>
            </div>
            <div
              style={{
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '10px',
                padding: '15px',
                width: '48%'
              }}
            >
              <h2
                style={{
                  color: '#2196F3',
                  fontSize: '18px',
                  marginBottom: '10px'
                }}
              >
                Total Earnings
              </h2>
              <pre
                style={{
                  fontSize: '14px',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {totalEarnings}
              </pre>
            </div>
          </div>
          <div
            style={{
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: '10px',
              padding: '15px'
            }}
          >
            <h2
              style={{
                color: '#FFA500',
                fontSize: '18px',
                marginBottom: '10px'
              }}
            >
              Recent Winnings
            </h2>
            {recentWinnings.map((winning, index) => (
              <p
                key={index}
                style={{
                  fontSize: '14px',
                  marginBottom: '5px'
                }}
              >
                {winning.round.name}: {winning.amount.toFixed(4)} {winning.round.denomination}
              </p>
            ))}
          </div>
        </div>
      ),
      intents: [
        <Button value="back" action="/">
          New Search
        </Button>
      ]
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return c.res({
      image: (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1E1E1E',
            width: '100%',
            height: '100%',
            padding: '20px',
            color: 'white'
          }}
        >
          <h1
            style={{
              color: '#FF6347',
              fontSize: '24px',
              marginBottom: '20px'
            }}
          >
            Oops!
          </h1>
          <p
            style={{
              fontSize: '18px'
            }}
          >
            Couldn't fetch user data. Try again?
          </p>
        </div>
      ),
      intents: [
        <Button value="back" action="/">
          Back to Search
        </Button>
      ]
    });
  }
});

const port = 8000;
console.log(`Server is running on port ${port}`);

devtools(app, { serveStatic });

serve({
  fetch: app.fetch,
  port
});
