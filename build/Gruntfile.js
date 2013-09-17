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
				src: ['../public/js/namespaces.js','../public/js/**/*.js'],
				dest: '../<%= pkg.name %>.js'
			}
		},

		uglify: {
			dist: {
				files: {
					'../<%= pkg.name %>.min.js': '../<%= pkg.name %>.js'
				},
				options: {
					banner:'<%= banner %>'
				}
			}
		},

		copy: {
			injector: {
				src: ['../<%= pkg.name %>.js', '../<%= pkg.name %>.min.js'],
				dest: '../public/dist/*/'
			}
		},

		watch: {
			files: ['../public/js/*.js'],
			tasks: ['concat:dist','uglify:dist', 'copy:injector']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', ['concat','uglify','copy']);
};