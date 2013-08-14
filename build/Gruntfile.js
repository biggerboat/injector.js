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
				src: ['../src/public_html/js/namespaces.js','../src/public_html/js/**/*.js'],
				dest: '../src/public_html/dist/<%= pkg.name %>.js'
			}
		},

		uglify: {
			dist: {
				files: {
					'../src/public_html/dist/<%= pkg.name %>.min.js': '../src/public_html/dist/<%= pkg.name %>.js'
				},
				options: {
					banner:'<%= banner %>'
				}
			}
		},

		watch: {
			files: ['../src/public_html/js/*.js'],
			tasks: ['concat:dist','uglify:dist']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['concat','uglify']);
};