/**
 * Daily rotating motivational quotes. Picked deterministically by
 * day-of-year so the same athlete sees the same quote all day, but a
 * different one tomorrow. ~60 entries → repeat ~6× a year.
 */
const QUOTES = [
  { text: "Discipline is the bridge between goals and accomplishment.",          author: "Jim Rohn" },
  { text: "The man on top of the mountain didn't fall there.",                    author: "Vince Lombardi" },
  { text: "It's not the will to win that matters — everyone has that. It's the will to prepare to win.", author: "Paul \"Bear\" Bryant" },
  { text: "Hard work beats talent when talent doesn't work hard.",               author: "Tim Notke" },
  { text: "You miss 100% of the shots you don't take.",                          author: "Wayne Gretzky" },
  { text: "Success isn't owned. It's leased. And rent is due every day.",        author: "J.J. Watt" },
  { text: "I've failed over and over and over again in my life. That is why I succeed.", author: "Michael Jordan" },
  { text: "The only way to prove that you're a good sport is to lose.",          author: "Ernie Banks" },
  { text: "Champions keep playing until they get it right.",                     author: "Billie Jean King" },
  { text: "It's not whether you get knocked down; it's whether you get up.",     author: "Vince Lombardi" },
  { text: "If you can believe it, the mind can achieve it.",                     author: "Ronnie Lott" },
  { text: "The harder the battle, the sweeter the victory.",                     author: "Les Brown" },
  { text: "Don't count the days, make the days count.",                          author: "Muhammad Ali" },
  { text: "Pressure is a privilege.",                                            author: "Billie Jean King" },
  { text: "Excellence is not a singular act, but a habit.",                      author: "Aristotle" },
  { text: "What you do today can improve all your tomorrows.",                   author: "Ralph Marston" },
  { text: "Don't let what you cannot do interfere with what you can do.",        author: "John Wooden" },
  { text: "Be stronger than your strongest excuse.",                             author: "Unknown" },
  { text: "Strength does not come from winning. Your struggles develop your strengths.", author: "Arnold Schwarzenegger" },
  { text: "Small daily improvements over time lead to stunning results.",        author: "Robin Sharma" },
  { text: "The body achieves what the mind believes.",                           author: "Napoleon Hill" },
  { text: "Don't limit your challenges. Challenge your limits.",                 author: "Unknown" },
  { text: "Show me a guy who's afraid to look bad, and I'll show you a guy you can beat every time.", author: "Lou Brock" },
  { text: "Once you learn to quit, it becomes a habit.",                         author: "Vince Lombardi" },
  { text: "I am a member of a team, and I rely on the team. I defer to it and sacrifice for it.", author: "Mia Hamm" },
  { text: "It ain't over till it's over.",                                       author: "Yogi Berra" },
  { text: "There may be people that have more talent than you, but there's no excuse for anyone to work harder than you.", author: "Derek Jeter" },
  { text: "If you train hard, you'll not only be hard, you'll be hard to beat.", author: "Hershel Walker" },
  { text: "Persistence can change failure into extraordinary achievement.",      author: "Marv Levy" },
  { text: "Always make a total effort, even when the odds are against you.",     author: "Arnold Palmer" },
  { text: "Set your goals high, and don't stop till you get there.",             author: "Bo Jackson" },
  { text: "What hurts today makes you stronger tomorrow.",                       author: "Jay Cutler" },
  { text: "Confidence is contagious. So is lack of confidence.",                 author: "Vince Lombardi" },
  { text: "You're never really playing an opponent. You're playing yourself.",   author: "Arthur Ashe" },
  { text: "Make sure your worst enemy doesn't live between your own two ears.",  author: "Laird Hamilton" },
  { text: "The will to win is important, but the will to prepare is vital.",     author: "Joe Paterno" },
  { text: "Adversity causes some men to break, others to break records.",        author: "William A. Ward" },
  { text: "Today I will do what others won't, so tomorrow I can accomplish what others can't.", author: "Jerry Rice" },
  { text: "Wake up with determination. Go to bed with satisfaction.",            author: "George Lorimer" },
  { text: "Energy and persistence conquer all things.",                          author: "Benjamin Franklin" },
  { text: "Greatness is not in where we stand, but in what direction we are moving.", author: "Oliver Wendell Holmes" },
  { text: "If you're going through hell, keep going.",                           author: "Winston Churchill" },
  { text: "It's hard to beat a person who never gives up.",                      author: "Babe Ruth" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "Do something today that your future self will thank you for.",        author: "Sean Patrick Flanery" },
  { text: "The pain you feel today will be the strength you feel tomorrow.",     author: "Unknown" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Never let your head hang down. Never give up and sit down and grieve. Find another way.", author: "Satchel Paige" },
  { text: "You can't put a limit on anything. The more you dream, the farther you get.", author: "Michael Phelps" },
  { text: "I've never lost a game I just ran out of time.",                      author: "Michael Jordan" },
  { text: "Hard days are the best because that's when champions are made.",      author: "Gabby Douglas" },
  { text: "Champions are made when no one is watching.",                         author: "Unknown" },
  { text: "If it doesn't challenge you, it doesn't change you.",                 author: "Fred DeVito" },
  { text: "Train hard, win easy.",                                               author: "Sebastian Coe" },
  { text: "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing.", author: "Pelé" },
  { text: "Most people give up just when they're about to achieve success.",     author: "Ross Perot" },
  { text: "You have to expect things of yourself before you can do them.",       author: "Michael Jordan" },
  { text: "Tough times never last, but tough people do.",                        author: "Robert Schuller" },
  { text: "There is no substitute for hard work.",                               author: "Thomas Edison" },
  { text: "Your only limit is you.",                                             author: "Unknown" },
];

function dayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = (d - start) + ((start.getTimezoneOffset() - d.getTimezoneOffset()) * 60_000);
  return Math.floor(diff / 86_400_000);
}

export function getDailyQuote(date = new Date()) {
  return QUOTES[dayOfYear(date) % QUOTES.length];
}
