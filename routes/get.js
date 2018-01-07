module.exports = {
    path: '/api/welcome',
    handler: (request, reply) => {
        reply({
            welcome: 'Yes, there is an API here that talks JSON :-)'
        });
    },
    config: {
        pre: [
            {
                method(request, reply) {
                   console.log(request.headers)
                }
            }
        ],
        description: 'Get current user details'
    }
};
