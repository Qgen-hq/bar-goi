import { autoClassify } from './server/classifier.js';

console.log('Testing Auto-Classifier:');
console.log('1. BMW X5 2010 + Рулевая рейка ->', autoClassify('BMW X5 2010', 'Рулевая рейка'));
console.log('2. Toyota Camry 40 + Помпа водяная ->', autoClassify('Toyota Camry 40', 'Помпа водяная'));
console.log('3. Haval F7 + Бампер передний ->', autoClassify('Haval F7', 'Бампер передний'));
console.log('4. Hyundai Tucson + Колодки передние ->', autoClassify('Hyundai Tucson', 'Колодки передние'));
