import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [kerning, setKerning] = useState([0]);
  const [tracking, setTracking] = useState([0]);
  const [lineHeight, setLineHeight] = useState([1.5]);
  const [colorHue, setColorHue] = useState([262]);

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100">
        <div className="container mx-auto px-8 py-6 flex items-center justify-between">
          <h1 className="text-4xl font-black tracking-tighter" style={{ 
            WebkitTextStroke: '2px hsl(262, 83%, 58%)',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'Inter, sans-serif'
          }}>
            Designeasy
          </h1>
          <nav className="flex gap-8 items-center">
            <a href="#typography" className="text-sm hover:text-primary transition-colors">Типографика</a>
            <a href="#composition" className="text-sm hover:text-primary transition-colors">Композиция</a>
            <a href="#color" className="text-sm hover:text-primary transition-colors">Колористика</a>
            <a href="#styles" className="text-sm hover:text-primary transition-colors">Стили</a>
            <Button size="sm" className="rounded-full">Купить подписку</Button>
          </nav>
        </div>
      </header>

      <section className="pt-40 pb-32 px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-12 gap-16 items-center">
            <div className="col-span-7 animate-fade-in">
              <h2 className="text-[5rem] leading-[0.95] font-black mb-8 tracking-tight">
                Дизайн карточек для маркетплейсов –{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  легко
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-12 max-w-xl leading-relaxed">
                Интерактивная платформа для изучения композиции, типографики и колористики
              </p>
              <Button size="lg" className="rounded-full text-lg px-8 py-6 hover:scale-105 transition-transform">
                К программе
                <Icon name="ArrowRight" className="ml-2" size={20} />
              </Button>
            </div>
            <div className="col-span-5">
              <div className="w-full h-[500px] rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-xl border border-white/20 shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-8 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-3 gap-8">
            {[
              { icon: 'Type', title: 'Типографика', desc: 'Кернинг, трекинг, интерлиньяж, начертания', id: 'typography' },
              { icon: 'Layout', title: 'Композиция', desc: 'Симметрия, визуальный вес, фокусные центры', id: 'composition' },
              { icon: 'Palette', title: 'Колористика', desc: 'Теория цвета, цветовые схемы, гармония', id: 'color' },
              { icon: 'Layers', title: 'Стили карточек', desc: 'Минимализм, абстракция, реализм, неореализм', id: 'styles' },
              { icon: 'BarChart', title: 'Инфографика', desc: 'Размеры, программы, полезные ресурсы', id: 'infographic' },
              { icon: 'Sparkles', title: 'Практика', desc: 'Интерактивные задания и упражнения', id: 'practice' }
            ].map((item, i) => (
              <Card
                key={i}
                className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-0 bg-white/80 backdrop-blur-sm animate-fade-in group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon name={item.icon} size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-black mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="typography" className="py-32 px-8">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-6xl font-black mb-4">Типографика</h2>
          <p className="text-xl text-gray-600 mb-16">Управляйте расстояниями и начертаниями</p>

          <Tabs defaultValue="kerning" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="kerning">Кернинг</TabsTrigger>
              <TabsTrigger value="tracking">Трекинг</TabsTrigger>
              <TabsTrigger value="lineheight">Интерлиньяж</TabsTrigger>
              <TabsTrigger value="weight">Начертание</TabsTrigger>
            </TabsList>

            <TabsContent value="kerning" className="space-y-8">
              <Card className="p-12 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                <h3 className="text-3xl font-black mb-4">Кернинг</h3>
                <p className="text-gray-600 mb-8">Расстояние между двумя символами в слове</p>
                
                <div className="bg-white rounded-2xl p-8 mb-8 shadow-inner">
                  <p className="text-6xl font-black text-center" style={{ letterSpacing: `${kerning[0]}px` }}>
                    ПРИМЕР
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Отрицательный</span>
                    <span className="font-bold">{kerning[0]}px</span>
                    <span>Положительный</span>
                  </div>
                  <Slider
                    value={kerning}
                    onValueChange={setKerning}
                    min={-10}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="tracking" className="space-y-8">
              <Card className="p-12 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                <h3 className="text-3xl font-black mb-4">Трекинг</h3>
                <p className="text-gray-600 mb-8">Расстояние между всеми символами</p>
                
                <div className="bg-white rounded-2xl p-8 mb-8 shadow-inner">
                  <p className="text-5xl font-black text-center tracking-normal" style={{ letterSpacing: `${tracking[0] / 10}em` }}>
                    ПРИМЕР ТЕКСТА
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Плотный</span>
                    <span className="font-bold">{tracking[0]}</span>
                    <span>Разреженный</span>
                  </div>
                  <Slider
                    value={tracking}
                    onValueChange={setTracking}
                    min={-5}
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="lineheight" className="space-y-8">
              <Card className="p-12 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                <h3 className="text-3xl font-black mb-4">Интерлиньяж</h3>
                <p className="text-gray-600 mb-8">Расстояние между строками текста</p>
                
                <div className="bg-white rounded-2xl p-8 mb-8 shadow-inner">
                  <p className="text-3xl font-bold" style={{ lineHeight: lineHeight[0] }}>
                    Первая строка текста<br />
                    Вторая строка текста<br />
                    Третья строка текста
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Плотный</span>
                    <span className="font-bold">{lineHeight[0].toFixed(1)}</span>
                    <span>Разреженный</span>
                  </div>
                  <Slider
                    value={lineHeight}
                    onValueChange={setLineHeight}
                    min={0.8}
                    max={2.5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="weight" className="space-y-8">
              <Card className="p-12 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                <h3 className="text-3xl font-black mb-4">Начертание</h3>
                <p className="text-gray-600 mb-8">Жирность шрифта для создания акцентов</p>
                
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { weight: 300, label: 'Light' },
                    { weight: 400, label: 'Regular' },
                    { weight: 700, label: 'Bold' },
                    { weight: 900, label: 'Black' }
                  ].map((item) => (
                    <div key={item.weight} className="bg-white rounded-2xl p-6 shadow-inner">
                      <p className="text-sm text-gray-500 mb-2">{item.label}</p>
                      <p className="text-4xl" style={{ fontWeight: item.weight }}>
                        Пример
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section id="composition" className="py-32 px-8 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-6xl font-black mb-4">Композиция</h2>
          <p className="text-xl text-gray-600 mb-16">Симметрия, вес и фокусные центры</p>

          <div className="grid grid-cols-2 gap-8">
            <Card className="p-8 border-0 shadow-lg">
              <h3 className="text-2xl font-black mb-6">Визуальный вес</h3>
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 h-64 flex items-center justify-center">
                <div className="space-y-4 w-full">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-full bg-primary" />
                    <div className="w-8 h-8 rounded-full bg-secondary" />
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary" />
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mt-4">Размер и цвет влияют на визуальный вес элемента</p>
            </Card>

            <Card className="p-8 border-0 shadow-lg">
              <h3 className="text-2xl font-black mb-6">Фокусный центр</h3>
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 h-64 flex items-center justify-center relative">
                <div className="w-16 h-16 rounded-full bg-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg" />
                <div className="w-8 h-8 rounded-full bg-gray-300 absolute top-4 left-4" />
                <div className="w-8 h-8 rounded-full bg-gray-300 absolute top-4 right-4" />
                <div className="w-8 h-8 rounded-full bg-gray-300 absolute bottom-4 left-4" />
                <div className="w-8 h-8 rounded-full bg-gray-300 absolute bottom-4 right-4" />
              </div>
              <p className="text-gray-600 mt-4">Направьте взгляд пользователя на главное</p>
            </Card>
          </div>
        </div>
      </section>

      <section id="color" className="py-32 px-8">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-6xl font-black mb-4">Колористика</h2>
          <p className="text-xl text-gray-600 mb-16">Теория цвета и цветовые схемы</p>

          <Card className="p-12 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
            <h3 className="text-3xl font-black mb-8">Интерактивный выбор цвета</h3>
            
            <div className="bg-white rounded-2xl p-12 mb-8 shadow-inner">
              <div 
                className="rounded-xl p-8 mb-4 transition-all duration-300"
                style={{ backgroundColor: `hsl(${colorHue[0]}, 83%, 58%)` }}
              >
                <h4 className="text-4xl font-black text-white mb-2">Заголовок</h4>
                <p className="text-white text-lg">Пример текста с выбранным цветом фона</p>
              </div>
              <div className="text-center text-sm text-gray-600 font-mono">
                HSL({colorHue[0]}, 83%, 58%)
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Красный</span>
                <span className="font-bold">{colorHue[0]}°</span>
                <span>Фиолетовый</span>
              </div>
              <Slider
                value={colorHue}
                onValueChange={setColorHue}
                min={0}
                max={360}
                step={1}
                className="w-full"
              />
              <div className="flex gap-2 mt-4">
                {[0, 30, 120, 180, 240, 262, 300].map((hue) => (
                  <button
                    key={hue}
                    onClick={() => setColorHue([hue])}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform"
                    style={{ backgroundColor: `hsl(${hue}, 83%, 58%)` }}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section id="styles" className="py-32 px-8 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-6xl font-black mb-4">Стили карточек</h2>
          <p className="text-xl text-gray-600 mb-16">Популярные стили для маркетплейсов</p>

          <div className="grid grid-cols-2 gap-8">
            {[
              { title: 'Минимализм', desc: 'Простота, белое пространство, минимум элементов' },
              { title: 'Абстракционизм', desc: 'Геометрические формы, яркие цвета, динамика' },
              { title: 'Реализм', desc: 'Фотографичность, детализация, естественность' },
              { title: 'Неореализм', desc: 'Современный реализм с цифровой обработкой' }
            ].map((style, i) => (
              <Card key={i} className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl h-48 mb-6" />
                <h3 className="text-2xl font-black mb-2">{style.title}</h3>
                <p className="text-gray-600">{style.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-8 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-6xl font-black mb-6">Начните обучение</h2>
          <p className="text-xl mb-12 opacity-90">
            Получите доступ ко всем разделам за 2000₽
          </p>
          <Button size="lg" variant="secondary" className="rounded-full text-lg px-12 py-6 hover:scale-105 transition-transform">
            Купить подписку
          </Button>
        </div>
      </section>

      <footer className="py-12 px-8 bg-secondary text-white">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <p className="text-2xl font-black">Designeasy</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-primary transition-colors">Контакты</a>
            <a href="#" className="hover:text-primary transition-colors">Поддержка</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
