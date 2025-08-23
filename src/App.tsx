import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import * as chrono from 'chrono-node';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState<{ localTime: string; timeLeft: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = (value?: string) => {
    const finalValue = typeof value === 'string' ? value : inputValue;
    setError(null);
    setResult(null);

    if (!finalValue) {
      setError('Please enter a date and time.');
      return;
    }

    const parsedDate = chrono.parseDate(finalValue);

    if (!parsedDate) {
      setError('⚠️ Couldn\'t understand that time. Try a format like "Monday, Aug 25 at midnight PT"');
      return;
    }

    const localTime = new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short',
    }).format(parsedDate);

    const now = new Date();
    const diff = parsedDate.getTime() - now.getTime();

    if (diff < 0) {
      setError('The specified time is in the past.');
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const timeLeft = `${days} days, ${hours} hours, ${minutes} minutes`;

    setResult({ localTime, timeLeft });
  };

  useEffect(() => {
    // default conversion on first load
    handleConvert('Monday, Aug 25 at midnight PT');
  }, []);

  const handleExampleClick = (example: string) => {
    setInputValue(example);
    handleConvert(example);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 font-sans">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-destructive bg-clip-text text-transparent">WhenInMyTime</h1>
        <p className="text-lg text-muted-foreground">Convert any date/time to your local time zone instantly.</p>
      </header>

      <main className="w-full max-w-md mx-auto text-center">
        <Card>
          <CardHeader className="p-5 pb-2 text-center">
            <CardTitle className="text-2xl">Enter a Date & Time</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-3 text-center">
            <div className="grid w-full items-center gap-4">
              <Input
                type="text"
                placeholder="Monday, Aug 25 at midnight PT"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setInputValue('')}
                onKeyPress={(e) => e.key === 'Enter' && handleConvert()}
              />
              <Button onClick={() => handleConvert()}>Convert</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-2.5">
          <CardHeader className="p-4 pb-2 text-center">
            <CardTitle className="text-2xl">You could try...</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 flex flex-wrap gap-2 justify-center text-center">
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200" onClick={() => handleExampleClick('in 3 days time')}>in 3 days time</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200" onClick={() => handleExampleClick('Next Friday at 5pm')}>Next Friday at 5pm</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200" onClick={() => handleExampleClick('in 2 weeks')}>in 2 weeks</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200" onClick={() => handleExampleClick('Tomorrow at noon')}>Tomorrow at noon</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200" onClick={() => handleExampleClick('Monday, Aug 25 at midnight PT')}>Monday, Aug 25 at midnight PT</Badge>
          </CardContent>
        </Card>

        {error && (
          <Card className="mt-4 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="mt-2.5">
            <CardHeader className="p-4 pb-1 text-center">
              <CardTitle className="text-xl">Result</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-2 text-lg text-center">
              <p className="mb-0">
                <span className="font-bold">🕒 Local Time:</span> {result.localTime}
              </p>
              <p>
                <span className="font-bold">⏳ Time Left:</span> {result.timeLeft}
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>built with ❤️ by <a href="https://craftedbyhan.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-primary">han</a>. Your local time zone is automatically detected by your browser.</p>
      </footer>
    </div>
  );
}

export default App;
