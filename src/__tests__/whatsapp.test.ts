import { Meal, TaskActions } from '../types';
import axios from 'axios';
import * as utils from '../utils';
import { MessageMedia } from 'whatsapp-web.js';

jest.mock('axios');
// const mockedAxios = jest.mocked('axios');

describe('Meal schedule', () => {
	describe.each`
		date                               | meal              | expectedFood
		${new Date('2022-02-19T14:53:01')} | ${Meal.BREAKFAST} | ${'eggs'}
		${new Date('2022-02-20T09:20:02')} | ${Meal.BREAKFAST} | ${'eggs'}
		${new Date('2022-02-20T08:20:03')} | ${Meal.BREAKFAST} | ${'eggs'}
		${new Date('2022-02-20T14:53:04')} | ${Meal.BREAKFAST} | ${'potato burekas'}
		${new Date('2022-02-19T14:53:05')} | ${Meal.LUNCH}     | ${'falafel & orange soup'}
		${new Date('2022-02-20T13:20:06')} | ${Meal.LUNCH}     | ${'falafel & orange soup'}
		${new Date('2022-02-20T14:53:07')} | ${Meal.LUNCH}     | ${'sweet potato quiche & tomato soup'}
		${new Date('2022-02-27T14:53:08')} | ${Meal.LUNCH}     | ${'panini Monday & tomato soup'}
		${new Date('2022-02-19T22:53:09')} | ${Meal.DINNER}    | ${'sloppy joe and spaghetti'}
		${new Date('2022-02-26T22:53:10')} | ${Meal.DINNER}    | ${'stir fry'}
		${new Date('2022-02-20T19:30:11')} | ${Meal.DINNER}    | ${'sloppy joe and spaghetti'}
		${new Date('2022-02-27T19:30:12')} | ${Meal.DINNER}    | ${'stir fry'}
		${new Date('2022-02-20T22:53:13')} | ${Meal.DINNER}    | ${'schnitzel'}
		${new Date('2022-02-27T22:53:14')} | ${Meal.DINNER}    | ${'schnitzel'}
	`('$meal when requested at $date', ({ date, meal, expectedFood }) => {
		test(`${meal} returns ${expectedFood}`, () => {
			expect(utils.getNextFoodFromDateByMeal(meal as Meal, date as Date)).toBe(expectedFood);
		});
	});
});

// describe('Persistant data', () => {
// 	const persistantStorage = utils.PersistantStorage.shared;
// 	describe('tasks', () => {
// 		it('should be able to add tasks properly', () => {
// 			persistantStorage.addTask(TaskActions.TEST, 'test', 'test', 0);
// 			expect(persistantStorage.getTasks()).toContainEqual({
// 				action: TaskActions.TEST,
// 				userID: 'test',
// 				chatID: 'test',
// 				dueDate: 0,
// 				taskID: expect.any(String),
// 			});
// 		});
// 		it('should be able to delete tasks properly', () => {
// 			persistantStorage.deleteTestTasks();
// 			expect(persistantStorage.getTasks()).not.toContainEqual({
// 				action: TaskActions.TEST,
// 				userID: 'test',
// 				chatID: 'test',
// 				dueDate: 0,
// 			});
// 		});
// 	});
// 	describe('stickers', () => {
// 		const sticker = new MessageMedia('image/webp', 'dGVzdCBkYXRh');
// 		it('should be able to ban stickers properly', () => {
// 			persistantStorage.banSticker(sticker);
// 			expect(persistantStorage.isStickerBanned(sticker)).toBe(true);
// 			persistantStorage.unbanSticker(sticker);
// 		});
// 		it('should be able to unban stickers properly', () => {
// 			persistantStorage.banSticker(sticker);
// 			persistantStorage.unbanSticker(sticker);
// 			expect(persistantStorage.isStickerBanned(sticker)).toBe(false);
// 		});
// 	});
// });

// describe('Mishna Yomi', () => {
// 	it('should properly format the response', async () => {
// 		const mishah = await utils.getMishnaYomi('Berakhot', 1, 1);
// 		expect(mishah).toEqual({
// 			english:
// 				'The beginning of tractate _Berakhot_, the first tractate in the first of the six orders of Mishna, opens with a discussion of the recitation of _Shema_, as the recitation of _Shema_ encompasses an acceptance of the yoke of Heaven and of the mitzvot, and as such, forms the basis for all subsequent teachings. The Mishna opens with the laws regarding the appropriate time to recite _Shema_: *From when,* that is, from what time, does *one recite _Shema_ in the evening? From the time when the priests enter to partake of their _teruma._* Until when does the time for the recitation of the evening _Shema_ extend? *Until the end of the first watch.* The term used in the Torah (Deuteronomy 6:7) to indicate the time for the recitation of the evening _Shema_ is _beshokhbekha_, when you lie down, which refers to the time in which individuals go to sleep. Therefore, the time for the recitation of _Shema_ is the first portion of the night, when individuals typically prepare for sleep. *That is the statement of Rabbi Eliezer.* *The Rabbis say:* The time for the recitation of the evening _Shema_ is *until midnight.* *Rabban Gamliel says:* One may recite _Shema_ *until dawn,* indicating that _beshokhbekha_ is to be understood as a reference to the entire time people sleep in their beds, the whole night. The mishna relates that Rabban Gamliel practiced in accordance with his ruling. There was an *incident* where Rabban Gamliel’s *sons returned* very late *from a wedding hall. They said to him,* as they had been preoccupied with celebrating with the groom and bride: *We did not recite _Shema._ He said to them: If the dawn has not* yet *arrived, you are obligated to recite* _Shema_. Since Rabban Gamliel’s opinion disagreed with that of the Rabbis, he explained to his sons that the Rabbis actually agree with him, *and* that it is *not only* with regard to the _halakha_ of the recitation of _Shema_, *but rather, wherever the Sages say until midnight, the mitzva* may be performed *until dawn.* Rabban Gamliel cites several cases in support of his claim, such as *the burning of fats and limbs* on the altar. Due to the quantity of offerings each day, the priests were often unable to complete the burning of all of the fats and limbs, so they continued to be burned into the night, as it is written: “This is the law of the burnt offering: The burnt offering shall remain upon the pyre on the altar all night until morning, while the fire on the altar burns it” (Leviticus 6:2). *And,* with regard to *all* sacrifices, such as the sin-offerings and the guilt-offerings *that are eaten for one day* and night; although the Sages state that they may be eaten only until midnight, by Torah law they may be eaten *until dawn.* This is in accordance with the verse: “On the day on which it is offered must you eat. Do not leave it until the morning” (Leviticus 7:15). *If so, why did the Sages say* that they may be eaten only *until midnight?* This is *in order to distance a person from transgression,* as if one believes that he has until dawn to perform the mitzva, he might be negligent and postpone it until the opportunity to perform the mitzva has passed.',
// 			englishName: 'Mishnah Berakhot 1:1',
// 			hebrew:
// 				'מֵאֵימָתַי קוֹרִין אֶת שְׁמַע בְּעַרְבִית. מִשָּׁעָה שֶׁהַכֹּהֲנִים נִכְנָסִים לֶאֱכֹל בִּתְרוּמָתָן, עַד סוֹף הָאַשְׁמוּרָה הָרִאשׁוֹנָה, דִּבְרֵי רַבִּי אֱלִיעֶזֶר. וַחֲכָמִים אוֹמְרִים, עַד חֲצוֹת. רַבָּן גַּמְלִיאֵל אוֹמֵר, עַד שֶׁיַּעֲלֶה עַמּוּד הַשָּׁחַר. מַעֲשֶׂה שֶׁבָּאוּ בָנָיו מִבֵּית הַמִּשְׁתֶּה, אָמְרוּ לוֹ, לֹא קָרִינוּ אֶת שְׁמַע. אָמַר לָהֶם, אִם לֹא עָלָה עַמּוּד הַשַּׁחַר, חַיָּבִין אַתֶּם לִקְרוֹת. וְלֹא זוֹ בִּלְבַד, אֶלָּא כָּל מַה שֶּׁאָמְרוּ חֲכָמִים עַד חֲצוֹת, מִצְוָתָן עַד שֶׁיַּעֲלֶה עַמּוּד הַשָּׁחַר. הֶקְטֵר חֲלָבִים וְאֵבָרִים, מִצְוָתָן עַד שֶׁיַּעֲלֶה עַמּוּד הַשָּׁחַר. וְכָל הַנֶּאֱכָלִים לְיוֹם אֶחָד, מִצְוָתָן עַד שֶׁיַּעֲלֶה עַמּוּד הַשָּׁחַר. אִם כֵּן, לָמָּה אָמְרוּ חֲכָמִים עַד חֲצוֹת, כְּדֵי לְהַרְחִיק אֶת הָאָדָם מִן הָעֲבֵרָה: \n',
// 			hebrewName: 'משנה ברכות א׳:א׳',
// 		});
// 	});

// 	it('should return "mishna not in chapter" when out of range', async () => {
// 		const mishnaResponse = await utils.getMishnaYomi('Berakhot', 1, 6);
// 		expect(mishnaResponse).toBe('Mishna not in chapter');
// 	});

// 	it('should return error object when chaper is out of range', async () => {
// 		const mishnaResponse = await utils.getMishnaYomi('Berakhot', 10, 1);
// 		expect(mishnaResponse).toBe('Mishnah Berakhot ends at Chapter 9.');
// 	});
// });
