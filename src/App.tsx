import { Analytics } from '@vercel/analytics/react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import * as chrono from 'chrono-node';
import { FiX } from 'react-icons/fi';

// Result types
type SingleResult = { type: 'single'; localTime: string; timeLeft: string };
type RangeResult = {
  type: 'range';
  startLocal: string;
  endLocal: string;
  duration: string;
  phase?: 'upcoming' | 'ongoing' | 'ended';
  untilLabel?: string; // e.g., "Starts in 2 days" or "Ends in 3 hours"
};

type Result = SingleResult | RangeResult;

function App() {
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const formatDT = (d: Date) =>
    new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short',
    }).format(d);

  const humanDiff = (ms: number) => {
    const sign = ms < 0 ? -1 : 1;
    const diff = Math.abs(ms);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const str = `${days} days, ${hours} hours, ${minutes} minutes`;
    return sign < 0 ? `-${str}` : str;
  };

  const handleConvert = (value?: string) => {
    const finalValue = typeof value === 'string' ? value : inputValue;
    setError(null);
    setResult(null);

    if (!finalValue) {
      setError('Please enter a date and time.');
      return;
    }

    // Let chrono parse and detect ranges automatically
    const results = chrono.parse(finalValue);
    const first = results[0];

    if (!first) {
      setError('⚠️ Couldn\'t understand that time. Try a format like "Monday, Aug 25 at midnight PT"');
      return;
    }

    const now = new Date();

    if (first.end) {
      // Range result
      const start = first.start.date();
      const end = first.end.date();
      const durationMs = end.getTime() - start.getTime();
      const duration = humanDiff(durationMs);

      let phase: RangeResult['phase'] = 'ended';
      let untilLabel: string | undefined;
      if (now < start) {
        phase = 'upcoming';
        untilLabel = `Starts in ${humanDiff(start.getTime() - now.getTime())}`;
      } else if (now >= start && now <= end) {
        phase = 'ongoing';
        untilLabel = `Ends in ${humanDiff(end.getTime() - now.getTime())}`;
      } else {
        phase = 'ended';
        untilLabel = undefined;
      }

      const rangeResult: RangeResult = {
        type: 'range',
        startLocal: formatDT(start),
        endLocal: formatDT(end),
        duration,
        phase,
        untilLabel,
      };
      setResult(rangeResult);
      return;
    }

    // Single date/time
    const parsedDate = first.date ? first.date() : chrono.parseDate(finalValue);

    if (!parsedDate) {
      setError('⚠️ Couldn\'t understand that time. Try a format like "Monday, Aug 25 at midnight PT"');
      return;
    }

    const diff = parsedDate.getTime() - now.getTime();

    if (diff < 0) {
      // Keep behavior: warn if in the past
      setError('The specified time is in the past.');
      return;
    }

    const timeLeft = humanDiff(diff);
    setResult({ type: 'single', localTime: formatDT(parsedDate), timeLeft });
  };

  useEffect(() => {
    // default conversion on first load
    handleConvert('in 3 days time');
  }, []);

  const handleExampleClick = (example: string) => {
    setInputValue(example);
    handleConvert(example);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 font-sans">
      <Analytics />
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-destructive bg-clip-text text-transparent">WhenInMyTime</h1>
        <p className="text-lg text-muted-foreground">Convert any date/time to your local time zone instantly.</p>
      </header>

      <main className="w-full max-w-md mx-auto text-center">
        {/* Input */}
        <Card>
          <CardHeader className="p-5 pb-2 text-center">
            <CardTitle className="text-2xl">Enter a Date & Time</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-3 text-center">
            <div className="grid w-full items-center gap-4">
              <div className="relative">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Monday, Aug 25 at midnight PT"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleConvert()}
                  className="pr-9"
                />
                {inputValue && (
                  <button
                    type="button"
                    aria-label="Clear input"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setInputValue('');
                      inputRef.current?.focus();
                    }}
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button onClick={() => handleConvert()}>Convert</Button>
            </div>
          </CardContent>
        </Card>

        {/* Outcome area: Error or Result in the middle */}
        {error ? (
          <Card className="mt-4 border-destructive">
            <CardHeader className="p-4 pb-2 text-center">
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-2 text-center">
              <p>{error}</p>
            </CardContent>
          </Card>
        ) : result ? (
          <Card className="mt-4">
            <CardHeader className="p-4 pb-1 text-center">
              <CardTitle className="text-xl">Result</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-2 text-lg text-center">
              {result.type === 'single' ? (
                <div>
                  <p className="mb-0">
                    <span className="font-bold">🕒 Local Time:</span> {result.localTime}
                  </p>
                  <p>
                    <span className="font-bold">⏳ Time Left:</span> {result.timeLeft}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="mb-1">
                    <span className="font-bold">🟢 Starts:</span> {result.startLocal}
                  </p>
                  <p className="mb-1">
                    <span className="font-bold">🔴 Ends:</span> {result.endLocal}
                  </p>
                  <p className="mb-1">
                    <span className="font-bold">📏 Duration:</span> {result.duration}
                  </p>
                  {result.untilLabel && (
                    <p className="text-sm text-muted-foreground">{result.untilLabel}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* Examples moved to the bottom */}
        <Card className="mt-4">
          <CardHeader className="p-4 pb-2 text-center">
            <CardTitle className="text-2xl">You could try...</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 flex flex-wrap gap-2 justify-center text-center">
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              onClick={() => handleExampleClick('in 3 days time')}
            >
              in 3 days time
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              onClick={() => handleExampleClick('Next Friday at 5pm')}
            >
              Next Friday at 5pm
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              onClick={() => handleExampleClick('in 2 weeks')}
            >
              in 2 weeks
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              onClick={() => handleExampleClick('Tomorrow at noon')}
            >
              Tomorrow at noon
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              onClick={() => handleExampleClick('Monday, Aug 25 at midnight PT')}
            >
              Monday, Aug 25 at midnight PT
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              onClick={() => handleExampleClick('Aug 29 1pm PDT to Sep 1 1pm PDT')}
            >
              Aug 29 1pm PDT to Sep 1 1pm PDT
            </Badge>
          </CardContent>
        </Card>
      </main>

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          built with ❤️ by <a href="https://craftedbyhan.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-primary">han</a>. Your local time zone is automatically detected by your browser.
        </p>
      </footer>
    </div>
  );
}

export default App;
