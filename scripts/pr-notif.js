import Octokat from 'octokat';

const octo = new Octokat();
const users = new Map();
users.set('Bernardstanislas', 'stan');
users.set('pierr', 'pierr');
users.set('Thomass', 'tom');

const focusCoreRepo = octo.repos('KleeGroup', 'focus-core');
const focusComponentsRepo = octo.repos('KleeGroup', 'focus-components');

module.exports = robot => {
    robot.on('github-repo-event', event => {
        if (event.eventType === 'status') {
            const status = event.payload;
            let repo = null;
            switch (status.name) {
                case 'KleeGroup/focus-core':
                    repo = focusCoreRepo;
                    break;
                case 'KleeGroup/focus-components':
                    repo = focusComponentsRepo;
                    break;
            }
            if (repo !== null) {
                repo.pulls.fetch({state: 'open'}).then(pulls => {
                    let user = null;
                    const url = pulls.reduce((acc, pull) => {
                        if (pull.head.sha === status.sha && pull.assignee) {
                            user = users.get(pull.assignee.login);
                            acc = pull.htmlUrl;
                        }
                        return acc;
                    }, null);
                    if (user !== null) {
                        robot.send({room: user}, `Pull request ${url} state is now ${status.state} !`);
                    }
                });
            }
        }
    });
};