module.exports = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [
			2,
			'always',
			[
				'feat',
				'fix',
				'docs',
				'style',
				'refactor',
				'test',
				'chore',
				'ci',
				'build',
				'perf',
			],
		],
		'scope-enum': [
			2,
			'always',
			['backend', 'frontend', 'deploiment'],
		],
		'scope-empty': [2, 'never'],
		'type-empty': [2, 'never'],
		'subject-empty': [2, 'never'],
		'header-min-length': [2, 'always', 10],
		'header-max-length': [2, 'always', 100],
		'subject-case': [
			2,
			'never',
			['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
		],
		'subject-full-stop': [2, 'never', '.'],
	},
};
