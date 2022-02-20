// Create a ts-jest test that will fail
import { Meal, TaskActions } from '../types';
import * as utils from '../utils';

describe.each`
	date                               | meal              | expectedFood
	${new Date('2022-02-19T14:53:00')} | ${Meal.BREAKFAST} | ${'eggs'}
	${new Date('2022-02-20T09:20:00')} | ${Meal.BREAKFAST} | ${'eggs'}
	${new Date('2022-02-20T08:20:00')} | ${Meal.BREAKFAST} | ${'eggs'}
	${new Date('2022-02-20T14:53:00')} | ${Meal.BREAKFAST} | ${'potato burekas'}
	${new Date('2022-02-19T14:53:00')} | ${Meal.LUNCH}     | ${'falafel & orange soup'}
	${new Date('2022-02-20T13:20:00')} | ${Meal.LUNCH}     | ${'falafel & orange soup'}
	${new Date('2022-02-20T14:53:00')} | ${Meal.LUNCH}     | ${'sweet potato quiche & tomato soup'}
	${new Date('2022-02-27T14:53:00')} | ${Meal.LUNCH}     | ${'panini Monday & tomato soup'}
	${new Date('2022-02-19T22:53:00')} | ${Meal.DINNER}    | ${'sloppy joe and spaghetti'}
	${new Date('2022-02-26T22:53:00')} | ${Meal.DINNER}    | ${'stir fry'}
	${new Date('2022-02-20T19:30:00')} | ${Meal.DINNER}    | ${'sloppy joe and spaghetti'}
	${new Date('2022-02-27T19:30:00')} | ${Meal.DINNER}    | ${'stir fry'}
	${new Date('2022-02-20T22:53:00')} | ${Meal.DINNER}    | ${'schnitzel'}
	${new Date('2022-02-27T22:53:00')} | ${Meal.DINNER}    | ${'schnitzel'}
`('$meal when requested at $date', ({ date, meal, expectedFood }) => {
	test(`${meal} returns ${expectedFood}`, () => {
		expect(utils.getNextFoodFromDateByMeal(meal as Meal, date as Date)).toBe(
			expectedFood
		);
	});
});

describe('Persistant data', () => {
	const persistantStorage = new utils.PersistantStorage();
	let storage = persistantStorage.get();
	persistantStorage.addTask(TaskActions.TEST, 'test', 'test', 0);
	it('should be able to add tasks properly', () => {
		expect(storage.tasks).toContainEqual({
			action: TaskActions.TEST,
			userID: 'test',
			chatID: 'test',
			dueDate: 0,
		});
	});
	it('should be able to delete tasks properly', () => {
		persistantStorage.deleteTestTasks();
		storage = persistantStorage.get();
		expect(storage.tasks).not.toContainEqual({
			action: TaskActions.TEST,
			userID: 'test',
			chatID: 'test',
			dueDate: 0,
		});
	});
});
