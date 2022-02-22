/**
 * Mock module for axios
 */

export default {
	get: jest.fn((url) => {
		switch (url) {
			case 'https://www.sefaria.org/api/texts/Mishnah_Berakhot.1.1?context=0':
				return Promise.resolve({
					data: {
						text: 'The beginning of tractate &lt;i&gt;Berakhot&lt;/i&gt;, the first tractate in the first of the six orders of Mishna, opens with a discussion of the recitation of &lt;i&gt;Shema&lt;/i&gt;, as the recitation of &lt;i&gt;Shema&lt;/i&gt; encompasses an acceptance of the yoke of Heaven and of the mitzvot, and as such, forms the basis for all subsequent teachings. The Mishna opens with the laws regarding the appropriate time to recite &lt;i&gt;Shema&lt;/i&gt;: &lt;br&gt;&lt;br&gt;&lt;b&gt;From when,&lt;/b&gt; that is, from what time, does &lt;b&gt;one recite &lt;i&gt;Shema&lt;/i&gt; in the evening? From the time when the priests enter to partake of their &lt;i&gt;teruma.&lt;/i&gt;&lt;/b&gt; Until when does the time for the recitation of the evening &lt;i&gt;Shema&lt;/i&gt; extend? &lt;b&gt;Until the end of the first watch.&lt;/b&gt; The term used in the Torah (Deuteronomy 6:7) to indicate the time for the recitation of the evening &lt;i&gt;Shema&lt;/i&gt; is &lt;i&gt;beshokhbekha&lt;/i&gt;, when you lie down, which refers to the time in which individuals go to sleep. Therefore, the time for the recitation of &lt;i&gt;Shema&lt;/i&gt; is the first portion of the night, when individuals typically prepare for sleep. &lt;b&gt;That is the statement of Rabbi Eliezer.&lt;/b&gt; &lt;b&gt;The Rabbis say:&lt;/b&gt; The time for the recitation of the evening &lt;i&gt;Shema&lt;/i&gt; is &lt;b&gt;until midnight.&lt;/b&gt; &lt;b&gt;Rabban Gamliel says:&lt;/b&gt; One may recite &lt;i&gt;Shema&lt;/i&gt; &lt;b&gt;until dawn,&lt;/b&gt; indicating that &lt;i&gt;beshokhbekha&lt;/i&gt; is to be understood as a reference to the entire time people sleep in their beds, the whole night. The mishna relates that Rabban Gamliel practiced in accordance with his ruling. There was an &lt;b&gt;incident&lt;/b&gt; where Rabban Gamliel’s &lt;b&gt;sons returned&lt;/b&gt; very late &lt;b&gt;from a wedding hall. They said to him,&lt;/b&gt; as they had been preoccupied with celebrating with the groom and bride: &lt;b&gt;We did not recite &lt;i&gt;Shema.&lt;/i&gt; He said to them: If the dawn has not&lt;/b&gt; yet &lt;b&gt;arrived, you are obligated to recite&lt;/b&gt; &lt;i&gt;Shema&lt;/i&gt;. Since Rabban Gamliel’s opinion disagreed with that of the Rabbis, he explained to his sons that the Rabbis actually agree with him, &lt;b&gt;and&lt;/b&gt; that it is &lt;b&gt;not only&lt;/b&gt; with regard to the &lt;i&gt;halakha&lt;/i&gt; of the recitation of &lt;i&gt;Shema&lt;/i&gt;, &lt;b&gt;but rather, wherever the Sages say until midnight, the mitzva&lt;/b&gt; may be performed &lt;b&gt;until dawn.&lt;/b&gt; Rabban Gamliel cites several cases in support of his claim, such as &lt;b&gt;the burning of fats and limbs&lt;/b&gt; on the altar. Due to the quantity of offerings each day, the priests were often unable to complete the burning of all of the fats and limbs, so they continued to be burned into the night, as it is written: “This is the law of the burnt offering: The burnt offering shall remain upon the pyre on the altar all night until morning, while the fire on the altar burns it” (Leviticus 6:2). &lt;b&gt;And,&lt;/b&gt; with regard to &lt;b&gt;all&lt;/b&gt; sacrifices, such as the sin-offerings and the guilt-offerings &lt;b&gt;that are eaten for one day&lt;/b&gt; and night; although the Sages state that they may be eaten only until midnight, by Torah law they may be eaten &lt;b&gt;until dawn.&lt;/b&gt; This is in accordance with the verse: “On the day on which it is offered must you eat. Do not leave it until the morning” (Leviticus 7:15). &lt;b&gt;If so, why did the Sages say&lt;/b&gt; that they may be eaten only &lt;b&gt;until midnight?&lt;/b&gt; This is &lt;b&gt;in order to distance a person from transgression,&lt;/b&gt; as if one believes that he has until dawn to perform the mitzva, he might be negligent and postpone it until the opportunity to perform the mitzva has passed.',
						he: 'מֵאֵימָתַי קוֹרִין אֶת שְׁמַע בְּעַרְבִית. מִשָּׁעָה שֶׁהַכֹּהֲנִים נִכְנָסִים לֶאֱכֹל בִּתְרוּמָתָן, עַד סוֹף הָאַשְׁמוּרָה הָרִאשׁוֹנָה, דִּבְרֵי רַבִּי אֱלִיעֶזֶר. וַחֲכָמִים אוֹמְרִים, עַד חֲצוֹת. רַבָּן גַּמְלִיאֵל אוֹמֵר, עַד שֶׁיַּעֲלֶה עַמּוּד הַשָּׁחַר. מַעֲשֶׂה שֶׁבָּאוּ בָנָיו מִבֵּית הַמִּשְׁתֶּה, אָמְרוּ לוֹ, לֹא קָרִינוּ אֶת שְׁמַע. אָמַר לָהֶם, אִם לֹא עָלָה עַמּוּד הַשַּׁחַר, חַיָּבִין אַתֶּם לִקְרוֹת. וְלֹא זוֹ בִּלְבַד, אֶלָּא כָּל מַה שֶּׁאָמְרוּ חֲכָמִים עַד חֲצוֹת, מִצְוָתָן עַד שֶׁיַּעֲלֶה עַמּוּד הַשָּׁחַר. הֶקְטֵר חֲלָבִים וְאֵבָרִים, מִצְוָתָן עַד שֶׁיַּעֲלֶה עַמּוּד הַשָּׁחַר. וְכָל הַנֶּאֱכָלִים לְיוֹם אֶחָד, מִצְוָתָן עַד שֶׁיַּעֲלֶה עַמּוּד הַשָּׁחַר. אִם כֵּן, לָמָּה אָמְרוּ חֲכָמִים עַד חֲצוֹת, כְּדֵי לְהַרְחִיק אֶת הָאָדָם מִן הָעֲבֵרָה: \n',
						ref: 'Mishnah Berakhot 1:1',
						heRef: 'משנה ברכות א׳:א׳',
					},
				});
				break;
			case 'https://www.sefaria.org/api/texts/Mishnah_Berakhot.1.6?context=0':
				return Promise.resolve({
					data: {
						ref: 'Mishnah Berakhot 1:6',
						heRef: 'משנה ברכות א׳:ו׳',
						text: '',
						he: '',
					},
				});
				break;
			case 'https://www.sefaria.org/api/texts/Mishnah_Berakhot.10.1?context=0':
				return Promise.resolve({
					data: {
						error: 'Mishnah Berakhot ends at Chapter 9.',
					},
				});
		}
	}),
};
