module.exports = {
	lintOnSave: false,

	configureWebpack: {
		resolve: {
			alias: {
				'views': '@/views',
				'components': '@/components',
				'assets': '@/assets',
				'router': '@/router',
			}
		}
	},
}