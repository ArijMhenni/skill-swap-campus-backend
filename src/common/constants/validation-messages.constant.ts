export const VALIDATION_MESSAGES = {
  EMAIL: {
    REQUIRED: 'L\'email est requis',
    INVALID: 'Format d\'email invalide',
  },
  
  PASSWORD: {
    REQUIRED: 'Le mot de passe est requis',
    MIN_LENGTH: 'Le mot de passe doit contenir au moins 6 caractères',
    WEAK: 'Le mot de passe est trop faible',
  },
  
  NAME: {
    REQUIRED: 'Le nom est requis',
    MIN_LENGTH: 'Le nom doit contenir au moins 2 caractères',
    MAX_LENGTH: 'Le nom ne peut pas dépasser 50 caractères',
    },

SKILL: {
    TITLE_REQUIRED: 'Le titre est requis',
    TITLE_MIN: 'Le titre doit contenir au moins 3 caractères',
    TITLE_MAX: 'Le titre ne peut pas dépasser 100 caractères',
    DESCRIPTION_REQUIRED: 'La description est requise',
    DESCRIPTION_MIN: 'La description doit contenir au moins 10 caractères',
    CATEGORY_REQUIRED: 'La catégorie est requise',
    TYPE_REQUIRED: 'Le type est requis',
    ESTIMATED_TIME_MIN: 'Le temps estimé doit être au moins 1 heure',
},

REQUEST: {
    SKILL_ID_REQUIRED: 'L ID de la compétence est requis',
    MESSAGE_MIN: 'Le message doit contenir au moins 10 caractères',
    STATUS_INVALID: 'Statut invalide',
},

MESSAGE: {
    CONTENT_REQUIRED: 'Le contenu est requis',
    CONTENT_MIN: 'Le message doit contenir au moins 1 caractère',
    CONTENT_MAX: 'Le message ne peut pas dépasser 1000 caractères',
},

RATING: {
    STARS_REQUIRED: 'Le nombre d\'étoiles est requis',
    STARS_MIN: 'Le nombre d\'étoiles doit être au moins 1',
    STARS_MAX: 'Le nombre d\'étoiles ne peut pas dépasser 5',
    COMMENT_MAX: 'Le commentaire ne peut pas dépasser 500 caractères',
},
};