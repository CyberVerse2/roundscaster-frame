import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Button, Frog, TextInput } from 'frog';
import { devtools } from 'frog/dev';
import { readFileSync } from 'fs';
import { join } from 'path';
import satori from 'satori';
// import { neynar } from 'frog/hubs'

export const app = new Frog({
  // Supply a Hub to enable frame verification.
  title: 'Roundscaster'
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
});

app.use('/*', serveStatic({ root: './public' }));

const fontPath = join(process.cwd(), 'Roboto-Regular.ttf');
const fontData = readFileSync(fontPath);

app.frame('/', (c) => {
  return c.res({
    action: '/stats',
    image: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'url("roundcaster_bg.jpg") center center no-repeat',
          backgroundSize: "cover",
          width: '100%',
          height: '100%',
          padding: '20px'
        }}
      >
        <h1 style={{ color: '#FFD700', fontSize: '48px', marginBottom: '20px' }}>Roundcaster</h1>
        <p style={{ color: '#FFFFFF', fontSize: '24px' }}>Discover Your Farcaster Earnings</p>
      </div>
    ),
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
      `https://exuberant-blood.pipeops.app/api/v1/rounds/user?userId=${farcasterId}`
    );
    const data = await response.json();
    console.log(data);

    const totalEarnings = data.totalEarnings.reduce(
      (acc: string, earning: { denomination: any; amount: number }) => {
        return acc + `${earning.denomination}: ${earning.amount.toFixed(2)}\n`;
      },
      ''
    );

    const svg = await satori(
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a1528',
          width: '100%',
          padding: '20px',
          fontFamily: 'Roboto'
        }}
      >
        <h1 style={{ color: '#FFD700', fontSize: '28px', marginBottom: '12px' }}>
          Farcaster ID: {farcasterId}
        </h1>
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-around',
            gap: '12px',
            marginBottom: '12px',
            position: 'relative'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'hsl(222.2 84% 4.9%)',
              paddingLeft: '8px',
              borderRadius: '10px',
              width: '45%',
              height: 'auto'
            }}
          >
            <h2 style={{ color: '#4CAF50', fontSize: '20px', marginBottom: '-8px' }}>
              Rounds Participated
            </h2>
            <p
              style={{
                color: '#FFFFFF',
                fontSize: '36px',
                textAlign: 'center'
              }}
            >
              {data.roundsParticipated.length}
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'hsl(222.2 84% 4.9%)',
              paddingLeft: '16px',
              borderRadius: '10px',
              width: '50%',
              height: 'auto'
            }}
          >
            <h2 style={{ color: '#2196F3', fontSize: '20px', marginBottom: '-8px' }}>
              Total Earnings
            </h2>
            <pre
              style={{
                color: '#FFFFFF',
                fontSize: '16px',
                display: 'block',
                whiteSpace: 'pre-wrap'
              }}
            >
              {totalEarnings}
            </pre>
          </div>
        </div>

        <div
          style={{
            width: '100%',
            height: '120px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'hsl(222.2 84% 4.9%)',
            paddingLeft: '16px',
            borderRadius: '10px',
            marginBottom: '8px',
            position: 'relative'
          }}
        >
          <h2
            style={{
              color: '#FFA500',
              fontSize: '20px',
              lineHeight: '1',
              marginBottom: '-2px'
            }}
          >
            Recent Winnings
          </h2>
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              marginTop: '-8px'
            }}
          >
            {data.winnings
              .slice(0, 2)
              .map(
                (
                  winning: { round: { name: any; denomination: any }; amount: number },
                  index: any
                ) => (
                  <p
                    key={index}
                    style={{ color: '#FFFFFF', fontSize: '14px', marginBottom: '-5px' }}
                  >
                    {winning.round.name}: {winning.amount.toFixed(4)} {winning.round.denomination}
                  </p>
                )
              )}
          </div>
        </div>
      </div>,
      {
        width: 600,
        height: 400,
        fonts: [
          {
            name: 'Roboto',
            data: fontData,
            weight: 400,
            style: 'normal'
          }
        ]
      }
    );

    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

    return c.res({
      image: dataUrl,
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
            padding: '20px'
          }}
        >
          <h1 style={{ color: '#FF6347', fontSize: '28px', marginBottom: '20px' }}>Oops!</h1>
          <p style={{ color: '#FFFFFF', fontSize: '20px' }}>Couldn't fetch user data. Try again?</p>
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

const port = 3000;
console.log(`Server is running on port ${port}`);

devtools(app, { serveStatic });

serve({
  fetch: app.fetch,
  port
});
