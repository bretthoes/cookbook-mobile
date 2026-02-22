import { Translations } from "./en"

const fr: Translations = {
  common: {
    ok: "OK !",
    cancel: "Annuler",
    back: "Retour",
    logOut: "Déconnexion",
  },
  welcomeScreen: {
    postscript:
      "psst  — Ce n'est probablement pas à quoi ressemble votre application. (À moins que votre designer ne vous ait donné ces écrans, dans ce cas, mettez la en prod !)",
    readyForLaunch: "Votre application, presque prête pour le lancement !",
    exciting: "(ohh, c'est excitant !)",
    letsGo: "Allons-y !",
  },
  errorScreen: {
    title: "Quelque chose s'est mal passé !",
    friendlySubtitle:
      "C'est l'écran que vos utilisateurs verront en production lorsqu'une erreur sera lancée. Vous voudrez personnaliser ce message (situé dans `app/i18n/fr.ts`) et probablement aussi la mise en page (`app/screens/ErrorScreen`). Si vous voulez le supprimer complètement, vérifiez `app/app.tsx` pour le composant <ErrorBoundary>.",
    reset: "RÉINITIALISER L'APPLICATION",
    traceTitle: "Erreur depuis %{name}",
  },
  emptyStateComponent: {
    generic: {
      heading: "Si vide... si triste",
      content:
        "Aucune donnée trouvée pour le moment. Essayez de cliquer sur le bouton pour rafraîchir ou recharger l'application.",
      button: "Essayons à nouveau",
    },
  },

  errors: {
    invalidEmail: "Adresse e-mail invalide.",
  },
  loginScreen: {
    logIn: "Se connecter",
    signIn: "---Sign In",
    enterDetails:
      "Entrez vos informations ci-dessous pour débloquer des informations top secrètes. Vous ne devinerez jamais ce que nous avons en attente. Ou peut-être que vous le ferez ; ce n'est pas de la science spatiale ici.",
    emailFieldLabel: "E-mail",
    passwordForgot: "---Forgot Password?",
    passwordFieldLabel: "Mot de passe",
    emailFieldPlaceholder: "Entrez votre adresse e-mail",
    passwordFieldPlaceholder: "Mot de passe super secret ici",
    tapToLogIn: "Appuyez pour vous connecter!",
    tapToSignIn: "---Tap to sign in!",
    rememberMe: "___Remember me",
    hint: "Astuce : vous pouvez utiliser n'importe quelle adresse e-mail et votre mot de passe préféré :)",
    register: "---No account? Register",
  },
  demoCommunityScreen: {
    title: "Connectez-vous avec la communauté",
    tagLine:
      "Rejoignez la communauté d'ingénieurs React Native d'Infinite Red et améliorez votre développement d'applications avec nous !",
    joinUsOnSlackTitle: "Rejoignez-nous sur Slack",
    joinUsOnSlack:
      "Vous souhaitez vous connecter avec des ingénieurs React Native du monde entier ? Rejoignez la conversation dans la communauté Slack d'Infinite Red ! Notre communauté en pleine croissance est un espace sûr pour poser des questions, apprendre des autres et développer votre réseau.",
    joinSlackLink: "Rejoindre la communauté Slack",
    makeIgniteEvenBetterTitle: "Rendre Ignite encore meilleur",
    makeIgniteEvenBetter:
      "Vous avez une idée pour rendre Ignite encore meilleur ? Nous sommes heureux de l'entendre ! Nous cherchons toujours des personnes qui veulent nous aider à construire les meilleurs outils React Native. Rejoignez-nous sur GitHub pour nous aider à construire l'avenir d'Ignite.",
    contributeToIgniteLink: "Contribuer à Ignite",
    theLatestInReactNativeTitle: "Les dernières nouvelles de React Native",
    theLatestInReactNative:
      "Nous sommes là pour vous tenir au courant de tout ce que React Native a à offrir.",
    reactNativeRadioLink: "React Native Radio",
    reactNativeNewsletterLink: "React Native Newsletter",
    reactNativeLiveLink: "React Native Live",
    chainReactConferenceLink: "Conférence Chain React",
    hireUsTitle: "Engagez Infinite Red pour votre prochain projet",
    hireUs:
      "Que ce soit pour gérer un projet complet ou pour former des équipes à notre formation pratique, Infinite Red peut vous aider pour presque tous les projets React Native.",
    hireUsLink: "Envoyez-nous un message",
  },
  demoShowroomScreen: {
    jumpStart: "Composants pour démarrer votre projet !",
    lorem2Sentences:
      "Nulla cupidatat deserunt amet quis aliquip nostrud do adipisicing. Adipisicing excepteur elit laborum Lorem adipisicing do duis.",
    demoHeaderTxExample: "Yay",
    demoViaTxProp: "Via la propriété `tx`",
    demoViaSpecifiedTxProp: "Via la propriété `{{prop}}Tx` spécifiée",
  },
  demoDebugScreen: {
    howTo: "COMMENT FAIRE",
    title: "Débugage",
    tagLine:
      "Félicitations, vous avez un modèle d'application React Native très avancé ici. Profitez de cette base de code !",
    reactotron: "Envoyer à Reactotron",
    reportBugs: "Signaler des bugs",
    demoList: "Liste de démonstration",
    demoPodcastList: "Liste de podcasts de démonstration",
    androidReactotronHint:
      "Si cela ne fonctionne pas, assurez-vous que l'application de bureau Reactotron est en cours d'exécution, exécutez adb reverse tcp:9090 tcp:9090 à partir de votre terminal, puis rechargez l'application.",
    iosReactotronHint:
      "Si cela ne fonctionne pas, assurez-vous que l'application de bureau Reactotron est en cours d'exécution, puis rechargez l'application.",
    macosReactotronHint:
      "Si cela ne fonctionne pas, assurez-vous que l'application de bureau Reactotron est en cours d'exécution, puis rechargez l'application.",
    webReactotronHint:
      "Si cela ne fonctionne pas, assurez-vous que l'application de bureau Reactotron est en cours d'exécution, puis rechargez l'application.",
    windowsReactotronHint:
      "Si cela ne fonctionne pas, assurez-vous que l'application de bureau Reactotron est en cours d'exécution, puis rechargez l'application.",
  },
  demoNavigator: {
    componentsTab: "Composants",
    debugTab: "Débugage",
    createTab: "Créer",
    communityTab: "Communauté",
    podcastListTab: "Podcast",
    cookbookListTab: "Livres de recettes",
    profileTab: "Profil",
  },
  pendingInvitationScreen: {
    title: "Vos invitations",
    subtitle: "Ces invitations sont en attente d'approbation.",
    accept: "Accepter",
    reject: "Rejeter",
    emptyState: "Aucune invitation en attente pour le moment. Revenez plus tard.",
  },
  profileScreen: {
    howTo: "COMMENT FAIRE",
    actions: "Actions",
    manageInfo: "Gérer vos informations.",
    title: "Profil",
    pendingInvites: "Voir vos invitations en attente",
    manageMemberships: "Gérer vos adhésions aux livres de recettes",
    preferences: "Préférences",
    customize: "Personnalisez votre expérience.",
    darkMode: "Mode sombre",
    preferredLanguage: "Choisissez votre langue préférée",
    setName: "Définir votre nom d'affichage",
    tagLine:
      "Félicitations, vous avez un modèle d'application React Native très avancé ici. Profitez de cette base de code !",
    reactotron: "Envoyer à Reactotron",
    reportBugs: "Signaler des bugs",
    demoList: "Liste de démonstration",
    demoPodcastList: "Liste de podcasts de démonstration",
    androidReactotronHint:
      "Si cela ne fonctionne pas, assurez-vous que l'application de bureau Reactotron est en cours d'exécution, exécutez adb reverse tcp:9090 tcp:9090 à partir de votre terminal, puis rechargez l'application.",
    iosReactotronHint:
      "Si cela ne fonctionne pas, assurez-vous que l'application de bureau Reactotron est en cours d'exécution, puis rechargez l'application.",
    macosReactotronHint:
      "Si cela ne fonctionne pas, assurez-vous que l'application de bureau Reactotron est en cours d'exécution, puis rechargez l'application.",
    webReactotronHint:
      "Si cela ne fonctionne pas, assurez-vous que l'application de bureau Reactotron est en cours d'exécution, puis rechargez l'application.",
    windowsReactotronHint:
      "Si cela ne fonctionne pas, assurez-vous que l'application de bureau Reactotron est en cours d'exécution, puis rechargez l'application.",
  },
  demoPodcastListScreen: {
    title: "Votre étagère",
    onlyFavorites: "Afficher uniquement les favoris",
    favoriteButton: "Favori",
    unfavoriteButton: "Retirer des favoris",
    accessibility: {
      cardHint:
        "Appuyez deux fois pour écouter l'épisode. Appuyez deux fois et maintenez pour {{action}} cet épisode.",
      switch: "Activer pour afficher uniquement les favoris",
      favoriteAction: "Basculer les favoris",
      favoriteIcon: "Épisode non favori",
      unfavoriteIcon: "Épisode favori",
      publishLabel: "Publié le {{date}}",
      durationLabel: "Durée : {{hours}} heures {{minutes}} minutes {{seconds}} secondes",
    },
    noFavoritesEmptyState: {
      heading: "Cela semble un peu vide",
      content:
        "Aucun favori n'a encore été ajouté. Appuyez sur le cœur d'un épisode pour l'ajouter à vos favoris !",
    },
    invitationListScreen: {
      title: "Mes invitations",
      onlyFavorites: "Afficher uniquement les favoris",
      favoriteButton: "Favori",
      unfavoriteButton: "Retirer des favoris",
      accessibility: {
        cardHint:
          "Appuyez deux fois pour ouvrir le livre de recettes. Appuyez deux fois et maintenez pour {{action}} ce livre.",
        switch: "Activer pour afficher uniquement les favoris",
        favoriteAction: "Basculer les favoris",
        favoriteIcon: "Livre de recettes non favori",
        unfavoriteIcon: "Livre de recettes favori",
        publishLabel: "Publié le {{date}}",
        durationLabel: "Durée : {{hours}} heures {{minutes}} minutes {{seconds}} secondes",
      },
      noFavoritesEmptyState: {
        heading: "Cela semble un peu vide",
        content:
          "Aucun favori n'a encore été ajouté. Appuyez sur le cœur d'un élément pour l'ajouter à vos favoris !",
      },
    },
    cookbookListScreen: {
      title: "Mes livres de recettes",
      onlyFavorites: "Afficher uniquement les favoris",
      favoriteButton: "Favori",
      unfavoriteButton: "Retirer des favoris",
      add: "Créer un nouveau livre de recettes",
      accessibility: {
        cardHint:
          "Appuyez deux fois pour ouvrir le livre de recettes. Appuyez deux fois et maintenez pour {{action}} ce livre.",
        switch: "Activer pour afficher uniquement les favoris",
        favoriteAction: "Basculer les favoris",
        favoriteIcon: "Livre de recettes non favori",
        unfavoriteIcon: "Livre de recettes favori",
        publishLabel: "Publié le {{date}}",
        durationLabel: "Durée : {{hours}} heures {{minutes}} minutes {{seconds}} secondes",
      },
      noFavoritesEmptyState: {
        heading: "Cela semble un peu vide",
        content:
          "Aucun favori n'a encore été ajouté. Appuyez sur le cœur d'un élément pour l'ajouter à vos favoris !",
      },
      cookbookCard: {
        membersLabel: "{{count}} membre",
        membersLabel_plural: "{{count}} membres",
        recipesLabel: "{{count}} recette",
        recipesLabel_plural: "{{count}} recettes",
      },
    },
    recipeDetailsScreen: {
      directions: "Instructions",
      ingredients: "Ingrédients",
      servings: "Portions",
      cook: "Temps de cuisson",
      prep: "Temps de préparation",
      bake: "Temps de cuisson au four",
      summary: "Résumé",
      edit: "Modifier",
    },
    recipeListScreen: {
      title: "Recettes",
      searchPlaceholder: "Rechercher",
      add: "Créer une nouvelle recette",
      edit: "Mettre à jour cette recette",
      invite: "Inviter quelqu'un d'autre",
      leave: "Quitter le livre de recettes",
    },
    recipeAddScreen: {
      title: "Ajouter une recette",
      titleHelper: "Le titre de la nouvelle recette",
      titlePlacehoder: "Titre",
    },
  },
  createScreen: {
    title: "Que voulez-vous créer ?",
  },
  recipeListScreen: {
    title: "Recettes",
    searchPlaceholder: "Rechercher",
    add: "Créer une nouvelle recette",
    edit: "Mettre à jour cette recette",
    invite: "Inviter quelqu'un d'autre",
    leave: "Quitter le livre de recettes",
  },
  cookbookDetailScreen: {
    addRecipe: "___Add Recipe",
    viewMembers: "___View Members",
    editCookbook: "___Edit Cookbook",
    leaveCookbook: "___Leave Cookbook",
  },
  recipeDetailsScreen: {
    directions: "Instructions",
    ingredients: "Ingrédients",
    servings: "Portions",
    cook: "Temps de cuisson",
    prep: "Temps de préparation",
    bake: "Temps de cuisson au four",
    summary: "Résumé",
    edit: "Modifier",
  },
  languageScreen: {
    support:
      "Si vous souhaitez demander la prise en charge d'une langue qui n'est pas répertoriée, veuillez utiliser le lien 'Signaler des bugs' dans l'onglet profil.",
    note: "Remarque : Vous devrez peut-être vous déconnecter et vous reconnecter pour que les modifications prennent effet.",
  },
}

export default fr
