import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar } from 'recharts';
import AnalysisQuestionnaire from '@/components/AnalysisQuestionnaire';
import { useToast } from '@/hooks/use-toast';

const analysisTypes = [
  {
    id: 'psychology',
    title: 'Психологический',
    icon: 'Brain',
    description: 'Анализ эмоционального состояния и личностных особенностей',
    color: 'from-purple-500 to-pink-500',
    score: 78
  },
  {
    id: 'career',
    title: 'Карьерный',
    icon: 'Briefcase',
    description: 'Оценка профессиональных навыков и траектории развития',
    color: 'from-blue-500 to-cyan-500',
    score: 85
  },
  {
    id: 'financial',
    title: 'Финансовый',
    icon: 'TrendingUp',
    description: 'Анализ финансовых привычек и планирования бюджета',
    color: 'from-green-500 to-emerald-500',
    score: 62
  },
  {
    id: 'health',
    title: 'Здоровье',
    icon: 'Heart',
    description: 'Оценка образа жизни, активности и самочувствия',
    color: 'from-red-500 to-orange-500',
    score: 71
  },
  {
    id: 'productivity',
    title: 'Продуктивность',
    icon: 'Zap',
    description: 'Анализ эффективности работы и управления временем',
    color: 'from-yellow-500 to-amber-500',
    score: 88
  },
  {
    id: 'complex',
    title: 'Комплексный',
    icon: 'Target',
    description: 'Полный анализ всех сфер жизни с общими рекомендациями',
    color: 'from-indigo-500 to-purple-500',
    score: 77
  }
];

const timelineData = [
  { date: 'Нед 1', psychology: 65, career: 70, health: 60, productivity: 75, financial: 55 },
  { date: 'Нед 2', psychology: 70, career: 75, health: 65, productivity: 80, financial: 58 },
  { date: 'Нед 3', psychology: 75, career: 80, health: 68, productivity: 85, financial: 60 },
  { date: 'Нед 4', psychology: 78, career: 85, health: 71, productivity: 88, financial: 62 }
];

const radarData = [
  { category: 'Психология', value: 78 },
  { category: 'Карьера', value: 85 },
  { category: 'Финансы', value: 62 },
  { category: 'Здоровье', value: 71 },
  { category: 'Продуктивность', value: 88 },
  { category: 'Баланс', value: 77 }
];

const recommendations = [
  {
    category: 'Психология',
    icon: 'Brain',
    tips: [
      'Начните вести дневник эмоций — 5 минут утром и вечером',
      'Попробуйте медитацию осознанности 10 минут в день',
      'Запланируйте встречу с близким другом на этой неделе'
    ]
  },
  {
    category: 'Карьера',
    icon: 'Briefcase',
    tips: [
      'Пройдите онлайн-курс по новому навыку в вашей сфере',
      'Обновите резюме и LinkedIn профиль',
      'Назначьте встречу 1-on-1 с ментором или руководителем'
    ]
  },
  {
    category: 'Финансы',
    icon: 'TrendingUp',
    tips: [
      'Создайте таблицу доходов и расходов за последний месяц',
      'Откройте накопительный счет и настройте автоперевод 10%',
      'Изучите 3 варианта инвестиций для новичков'
    ]
  },
  {
    category: 'Здоровье',
    icon: 'Heart',
    tips: [
      'Установите напоминание пить воду каждые 2 часа',
      'Добавьте 15-минутную прогулку после обеда',
      'Запланируйте профилактический визит к врачу'
    ]
  },
  {
    category: 'Продуктивность',
    icon: 'Zap',
    tips: [
      'Используйте технику Pomodoro: 25 минут работы + 5 минут отдыха',
      'Планируйте день с вечера, выделяя 3 главные задачи',
      'Уберите отвлекающие уведомления в рабочее время'
    ]
  }
];

const API_URL = 'https://functions.poehali.dev/29c703fc-5830-42ad-821e-def87a08c8a6';

export default function Index() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [userScores, setUserScores] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUserAnalyses();
  }, []);

  const loadUserAnalyses = async () => {
    setIsLoading(true);
    const response = await fetch(`${API_URL}?userId=1`);
    const data = await response.json();
    
    if (data.analyses && data.analyses.length > 0) {
      const latestScores: Record<string, number> = {};
      data.analyses.forEach((analysis: any) => {
        if (!latestScores[analysis.analysisType]) {
          latestScores[analysis.analysisType] = analysis.score;
        }
      });
      setUserScores(latestScores);
    }
    setIsLoading(false);
  };

  const handleStartAnalysis = (analysisType: string) => {
    setSelectedAnalysis(analysisType);
    setShowQuestionnaire(true);
  };

  const handleCompleteAnalysis = async (score: number, answers: Record<string, string>) => {
    const analysisType = analysisTypes.find(t => t.id === selectedAnalysis);
    if (!analysisType) return;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 1,
        analysisType: selectedAnalysis,
        score,
        answers,
        recommendations: recommendations.find(r => r.category === analysisType.title)?.tips || []
      })
    });

    if (response.ok) {
      toast({
        title: '✨ Анализ завершён!',
        description: `Ваш результат: ${score}%. Рекомендации обновлены.`
      });
      setUserScores(prev => ({ ...prev, [selectedAnalysis!]: score }));
      setShowQuestionnaire(false);
      setSelectedAnalysis(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-12 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-6 animate-scale-in">
            <Icon name="Sparkles" size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Личный Бот-Аналитик
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Твой персональный помощник для анализа и развития во всех сферах жизни
          </p>
        </header>

        <Tabs defaultValue="analysis" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="analysis">Анализ</TabsTrigger>
            <TabsTrigger value="progress">Прогресс</TabsTrigger>
            <TabsTrigger value="recommendations">Советы</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysisTypes.map((type, index) => {
                const currentScore = userScores[type.id] || type.score;
                return (
                  <Card
                    key={type.id}
                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 animate-slide-up overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handleStartAnalysis(type.id)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${type.color}`} />
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${type.color} group-hover:scale-110 transition-transform`}>
                          <Icon name={type.icon} size={24} className="text-white" />
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">{currentScore}%</div>
                          <div className="text-xs text-muted-foreground">оценка</div>
                        </div>
                      </div>
                      <CardTitle className="mt-4">{type.title}</CardTitle>
                      <CardDescription>{type.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Progress value={currentScore} className="h-2" />
                      <Button className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors" variant="outline">
                        Начать анализ
                        <Icon name="ArrowRight" size={16} className="ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="TrendingUp" size={24} className="text-primary" />
                    Динамика развития
                  </CardTitle>
                  <CardDescription>Прогресс по всем направлениям за последний месяц</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line type="monotone" dataKey="psychology" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                      <Line type="monotone" dataKey="career" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                      <Line type="monotone" dataKey="productivity" stroke="hsl(var(--chart-4))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Target" size={24} className="text-secondary" />
                    Радар компетенций
                  </CardTitle>
                  <CardDescription>Текущее состояние всех сфер жизни</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                      <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
                      <Radar name="Оценка" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="BarChart3" size={24} className="text-accent" />
                  Сравнение категорий
                </CardTitle>
                <CardDescription>Ваши показатели по каждой сфере</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={radarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card className="animate-fade-in mb-6 border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Icon name="Lightbulb" size={28} className="text-primary" />
                  Персональные рекомендации
                </CardTitle>
                <CardDescription className="text-base">
                  Конкретные шаги для улучшения каждой сферы жизни — начните с одного
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 gap-6">
              {recommendations.map((rec, index) => (
                <Card
                  key={rec.category}
                  className="animate-slide-up hover:shadow-lg transition-all"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon name={rec.icon} size={24} className="text-primary" />
                      </div>
                      {rec.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {rec.tips.map((tip, tipIndex) => (
                        <li
                          key={tipIndex}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group cursor-pointer"
                        >
                          <div className="mt-1 p-1 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors">
                            <Icon name="Check" size={14} className="text-primary" />
                          </div>
                          <span className="flex-1 text-sm">{tip}</span>
                          <Icon name="ChevronRight" size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {showQuestionnaire && selectedAnalysis && (
        <AnalysisQuestionnaire
          analysisType={selectedAnalysis}
          onComplete={handleCompleteAnalysis}
          onClose={() => {
            setShowQuestionnaire(false);
            setSelectedAnalysis(null);
          }}
        />
      )}
    </div>
  );
}