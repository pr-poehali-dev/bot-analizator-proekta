import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  text: string;
  options: { value: string; label: string; score: number }[];
}

interface QuestionnaireProps {
  analysisType: string;
  onComplete: (score: number, answers: Record<string, string>) => void;
  onClose: () => void;
}

const questionnaires: Record<string, Question[]> = {
  psychology: [
    {
      id: 'q1',
      text: 'Как часто вы чувствуете себя эмоционально истощённым?',
      options: [
        { value: 'rarely', label: 'Редко или никогда', score: 100 },
        { value: 'sometimes', label: 'Иногда', score: 60 },
        { value: 'often', label: 'Часто', score: 30 },
        { value: 'always', label: 'Постоянно', score: 0 }
      ]
    },
    {
      id: 'q2',
      text: 'Легко ли вам справляться со стрессом?',
      options: [
        { value: 'very_easy', label: 'Очень легко', score: 100 },
        { value: 'easy', label: 'Легко', score: 75 },
        { value: 'difficult', label: 'Сложно', score: 40 },
        { value: 'very_difficult', label: 'Очень сложно', score: 10 }
      ]
    },
    {
      id: 'q3',
      text: 'Как вы оцениваете свою уверенность в себе?',
      options: [
        { value: 'high', label: 'Высокая', score: 100 },
        { value: 'medium', label: 'Средняя', score: 70 },
        { value: 'low', label: 'Низкая', score: 30 },
        { value: 'very_low', label: 'Очень низкая', score: 0 }
      ]
    },
    {
      id: 'q4',
      text: 'Как часто вы испытываете позитивные эмоции?',
      options: [
        { value: 'daily', label: 'Каждый день', score: 100 },
        { value: 'weekly', label: 'Несколько раз в неделю', score: 70 },
        { value: 'rarely', label: 'Редко', score: 30 },
        { value: 'never', label: 'Почти никогда', score: 0 }
      ]
    },
    {
      id: 'q5',
      text: 'Легко ли вам выражать свои чувства другим людям?',
      options: [
        { value: 'very_easy', label: 'Очень легко', score: 100 },
        { value: 'easy', label: 'Легко', score: 70 },
        { value: 'difficult', label: 'Сложно', score: 40 },
        { value: 'very_difficult', label: 'Очень сложно', score: 10 }
      ]
    }
  ],
  career: [
    {
      id: 'q1',
      text: 'Насколько вы удовлетворены своей текущей работой?',
      options: [
        { value: 'very_satisfied', label: 'Очень доволен', score: 100 },
        { value: 'satisfied', label: 'Доволен', score: 75 },
        { value: 'neutral', label: 'Нейтрально', score: 50 },
        { value: 'dissatisfied', label: 'Недоволен', score: 20 }
      ]
    },
    {
      id: 'q2',
      text: 'Как часто вы развиваете новые профессиональные навыки?',
      options: [
        { value: 'constantly', label: 'Постоянно', score: 100 },
        { value: 'regularly', label: 'Регулярно', score: 80 },
        { value: 'sometimes', label: 'Иногда', score: 50 },
        { value: 'rarely', label: 'Редко', score: 20 }
      ]
    },
    {
      id: 'q3',
      text: 'Есть ли у вас чёткий план карьерного роста?',
      options: [
        { value: 'detailed', label: 'Детальный план', score: 100 },
        { value: 'general', label: 'Общее понимание', score: 70 },
        { value: 'vague', label: 'Смутные идеи', score: 40 },
        { value: 'none', label: 'Нет плана', score: 10 }
      ]
    },
    {
      id: 'q4',
      text: 'Как вы оцениваете баланс работы и личной жизни?',
      options: [
        { value: 'excellent', label: 'Отличный', score: 100 },
        { value: 'good', label: 'Хороший', score: 75 },
        { value: 'poor', label: 'Плохой', score: 40 },
        { value: 'very_poor', label: 'Очень плохой', score: 10 }
      ]
    },
    {
      id: 'q5',
      text: 'Насколько вы уверены в своих профессиональных компетенциях?',
      options: [
        { value: 'very_confident', label: 'Очень уверен', score: 100 },
        { value: 'confident', label: 'Уверен', score: 75 },
        { value: 'somewhat', label: 'Не очень уверен', score: 40 },
        { value: 'not_confident', label: 'Не уверен', score: 10 }
      ]
    }
  ],
  financial: [
    {
      id: 'q1',
      text: 'Ведёте ли вы учёт доходов и расходов?',
      options: [
        { value: 'detailed', label: 'Детальный учёт', score: 100 },
        { value: 'basic', label: 'Базовый учёт', score: 70 },
        { value: 'occasionally', label: 'Иногда слежу', score: 40 },
        { value: 'never', label: 'Не веду', score: 0 }
      ]
    },
    {
      id: 'q2',
      text: 'Есть ли у вас финансовая подушка безопасности?',
      options: [
        { value: '6months', label: 'На 6+ месяцев', score: 100 },
        { value: '3months', label: 'На 3-6 месяцев', score: 75 },
        { value: '1month', label: 'На 1-2 месяца', score: 40 },
        { value: 'none', label: 'Нет', score: 0 }
      ]
    },
    {
      id: 'q3',
      text: 'Откладываете ли вы деньги регулярно?',
      options: [
        { value: 'always', label: 'Каждый месяц', score: 100 },
        { value: 'often', label: 'Часто', score: 70 },
        { value: 'rarely', label: 'Редко', score: 30 },
        { value: 'never', label: 'Не откладываю', score: 0 }
      ]
    },
    {
      id: 'q4',
      text: 'Как часто вы испытываете финансовый стресс?',
      options: [
        { value: 'never', label: 'Никогда', score: 100 },
        { value: 'rarely', label: 'Редко', score: 70 },
        { value: 'sometimes', label: 'Иногда', score: 40 },
        { value: 'often', label: 'Часто', score: 10 }
      ]
    },
    {
      id: 'q5',
      text: 'Знакомы ли вы с инвестициями и используете ли их?',
      options: [
        { value: 'active', label: 'Активно инвестирую', score: 100 },
        { value: 'learning', label: 'Изучаю тему', score: 70 },
        { value: 'interested', label: 'Интересуюсь', score: 40 },
        { value: 'no', label: 'Не знаком', score: 10 }
      ]
    }
  ],
  health: [
    {
      id: 'q1',
      text: 'Как часто вы занимаетесь физической активностью?',
      options: [
        { value: 'daily', label: 'Каждый день', score: 100 },
        { value: '3-4times', label: '3-4 раза в неделю', score: 80 },
        { value: '1-2times', label: '1-2 раза в неделю', score: 50 },
        { value: 'rarely', label: 'Редко или никогда', score: 10 }
      ]
    },
    {
      id: 'q2',
      text: 'Как вы оцениваете качество своего питания?',
      options: [
        { value: 'excellent', label: 'Отличное', score: 100 },
        { value: 'good', label: 'Хорошее', score: 75 },
        { value: 'average', label: 'Среднее', score: 50 },
        { value: 'poor', label: 'Плохое', score: 20 }
      ]
    },
    {
      id: 'q3',
      text: 'Сколько часов вы спите в среднем?',
      options: [
        { value: '7-9', label: '7-9 часов', score: 100 },
        { value: '6-7', label: '6-7 часов', score: 70 },
        { value: '5-6', label: '5-6 часов', score: 40 },
        { value: 'less5', label: 'Менее 5 часов', score: 10 }
      ]
    },
    {
      id: 'q4',
      text: 'Проходите ли вы регулярные медицинские осмотры?',
      options: [
        { value: 'annually', label: 'Ежегодно', score: 100 },
        { value: 'sometimes', label: 'Иногда', score: 60 },
        { value: 'rarely', label: 'Редко', score: 30 },
        { value: 'never', label: 'Никогда', score: 0 }
      ]
    },
    {
      id: 'q5',
      text: 'Как часто вы испытываете физическое недомогание?',
      options: [
        { value: 'never', label: 'Никогда', score: 100 },
        { value: 'rarely', label: 'Редко', score: 75 },
        { value: 'sometimes', label: 'Иногда', score: 40 },
        { value: 'often', label: 'Часто', score: 10 }
      ]
    }
  ],
  productivity: [
    {
      id: 'q1',
      text: 'Насколько эффективно вы планируете свой день?',
      options: [
        { value: 'very', label: 'Очень эффективно', score: 100 },
        { value: 'well', label: 'Хорошо', score: 75 },
        { value: 'somewhat', label: 'Не очень', score: 40 },
        { value: 'not', label: 'Не планирую', score: 10 }
      ]
    },
    {
      id: 'q2',
      text: 'Как часто вы откладываете важные задачи?',
      options: [
        { value: 'never', label: 'Никогда', score: 100 },
        { value: 'rarely', label: 'Редко', score: 70 },
        { value: 'sometimes', label: 'Иногда', score: 40 },
        { value: 'often', label: 'Часто', score: 10 }
      ]
    },
    {
      id: 'q3',
      text: 'Используете ли вы инструменты для управления задачами?',
      options: [
        { value: 'regularly', label: 'Регулярно', score: 100 },
        { value: 'sometimes', label: 'Иногда', score: 70 },
        { value: 'rarely', label: 'Редко', score: 40 },
        { value: 'never', label: 'Никогда', score: 10 }
      ]
    },
    {
      id: 'q4',
      text: 'Насколько хорошо вы умеете концентрироваться?',
      options: [
        { value: 'excellent', label: 'Отлично', score: 100 },
        { value: 'good', label: 'Хорошо', score: 75 },
        { value: 'average', label: 'Средне', score: 50 },
        { value: 'poor', label: 'Плохо', score: 20 }
      ]
    },
    {
      id: 'q5',
      text: 'Удаётся ли вам завершать задачи в срок?',
      options: [
        { value: 'always', label: 'Всегда', score: 100 },
        { value: 'usually', label: 'Обычно', score: 75 },
        { value: 'sometimes', label: 'Иногда', score: 40 },
        { value: 'rarely', label: 'Редко', score: 10 }
      ]
    }
  ],
  complex: [
    {
      id: 'q1',
      text: 'Как вы оцениваете общее качество своей жизни?',
      options: [
        { value: 'excellent', label: 'Отлично', score: 100 },
        { value: 'good', label: 'Хорошо', score: 75 },
        { value: 'average', label: 'Средне', score: 50 },
        { value: 'poor', label: 'Плохо', score: 20 }
      ]
    },
    {
      id: 'q2',
      text: 'Удовлетворены ли вы балансом разных сфер жизни?',
      options: [
        { value: 'yes', label: 'Да, удовлетворён', score: 100 },
        { value: 'mostly', label: 'В основном да', score: 70 },
        { value: 'somewhat', label: 'Частично', score: 40 },
        { value: 'no', label: 'Нет', score: 10 }
      ]
    },
    {
      id: 'q3',
      text: 'Есть ли у вас чёткие жизненные цели?',
      options: [
        { value: 'clear', label: 'Чёткие цели', score: 100 },
        { value: 'general', label: 'Общие направления', score: 70 },
        { value: 'vague', label: 'Смутные идеи', score: 40 },
        { value: 'none', label: 'Нет целей', score: 10 }
      ]
    },
    {
      id: 'q4',
      text: 'Чувствуете ли вы, что развиваетесь как личность?',
      options: [
        { value: 'definitely', label: 'Определённо да', score: 100 },
        { value: 'yes', label: 'Да', score: 75 },
        { value: 'somewhat', label: 'Не очень', score: 40 },
        { value: 'no', label: 'Нет', score: 10 }
      ]
    },
    {
      id: 'q5',
      text: 'Как часто вы испытываете общую удовлетворённость жизнью?',
      options: [
        { value: 'daily', label: 'Каждый день', score: 100 },
        { value: 'often', label: 'Часто', score: 75 },
        { value: 'sometimes', label: 'Иногда', score: 40 },
        { value: 'rarely', label: 'Редко', score: 10 }
      ]
    }
  ]
};

export default function AnalysisQuestionnaire({ analysisType, onComplete, onClose }: QuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const questions = questionnaires[analysisType] || [];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (!answers[questions[currentQuestion].id]) {
      toast({
        title: 'Выберите ответ',
        description: 'Пожалуйста, выберите один из вариантов ответа',
        variant: 'destructive'
      });
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      const totalScore = questions.reduce((sum, q) => {
        const answer = answers[q.id];
        const option = q.options.find(opt => opt.value === answer);
        return sum + (option?.score || 0);
      }, 0);
      const averageScore = Math.round(totalScore / questions.length);
      onComplete(averageScore, answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-2xl animate-scale-in">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl">Опросник</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
          <CardDescription>
            Вопрос {currentQuestion + 1} из {questions.length}
          </CardDescription>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{currentQ?.text}</h3>
            <RadioGroup
              value={answers[currentQ?.id]}
              onValueChange={(value) => handleAnswer(currentQ?.id, value)}
              className="space-y-3"
            >
              {currentQ?.options.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <Icon name="ChevronLeft" size={16} className="mr-2" />
              Назад
            </Button>
            <Button onClick={handleNext}>
              {currentQuestion === questions.length - 1 ? 'Завершить' : 'Далее'}
              {currentQuestion < questions.length - 1 && (
                <Icon name="ChevronRight" size={16} className="ml-2" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
