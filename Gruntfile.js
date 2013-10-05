module.exports = function (grunt) {
	grunt.initConfig({
		pkg:grunt.file.readJSON('package.json'),
		banner:'/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>; \n*/\n',

		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: ['public/js/namespaces.js','public/js/**/*.js'],
				dest: '<%= pkg.name %>.js'
			}
		},

		uglify: {
			dist: {
				files: {
					'<%= pkg.name %>.min.js': '<%= pkg.name %>.js'
				},
				options: {
					banner:'<%= banner %>'
				}
			}
		},

		copy: {
			injector: {
				src: ['<%= pkg.name %>.js', '<%= pkg.name %>.min.js'],
				dest: 'public/dist/'
			}
		},

		watch: {
			files: ['public/js/*.js'],
			tasks: ['concat:dist','uglify:dist', 'copy:injector']
		},

		bump: {
			options: {
				files: ['package.json', 'bower.json'],
				updateConfigs: ["pkg","banner"],
				commit: true,
				commitMessage: 'Release v%VERSION%',
				commitFiles: ['package.json', 'bower.json', '<%= pkg.name %>.min.js', '<%= pkg.name %>.js'], // '-a' for all files
				createTag: true,
				tagName: 'v%VERSION%',
				tagMessage: 'Version %VERSION%',
				push: true,
				pushTo: 'origin master',
				gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-bump');

	grunt.registerTask('default', ['concat','uglify','copy']);

	grunt.registerTask('release', ['default','bump-commit']);
	grunt.registerTask('release:patch', ['bump-only:patch','release']);
	grunt.registerTask('release:minor', ['bump-only:minor','release']);
	grunt.registerTask('release:major', ['bump-only:major','release']);
};