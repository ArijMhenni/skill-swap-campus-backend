export const ERROR_MESSAGES = {
  // Auth
  AUTH: {
    INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
    USER_ALREADY_EXISTS: 'Un utilisateur avec cet email existe déjà',
    UNAUTHORIZED: 'Non autorisé',
    TOKEN_EXPIRED: 'Token expiré',
    TOKEN_INVALID: 'Token invalide',
    USER_BANNED: 'Votre compte a été banni',
  },
  
  // User
  USER: {
    NOT_FOUND: 'Utilisateur non trouvé',
    UPDATE_FAILED: 'Échec de la mise à jour du profil',
  },
  
  // Skill
  SKILL: {
    NOT_FOUND: 'Compétence non trouvée',
    UNAUTHORIZED_UPDATE: 'Vous ne pouvez modifier que vos propres compétences',
    UNAUTHORIZED_DELETE: 'Vous ne pouvez supprimer que vos propres compétences',
    CREATE_FAILED: 'Échec de la création de la compétence',
  },
  
  // Request
  REQUEST: {
    NOT_FOUND: 'Demande non trouvée',
    CANNOT_REQUEST_OWN_SKILL: 'Vous ne pouvez pas demander votre propre compétence',
    UNAUTHORIZED_ACCESS: 'Vous n\'avez pas accès à cette demande',
    INVALID_STATUS_TRANSITION: 'Transition de statut invalide',
    ALREADY_COMPLETED: 'Cette demande est déjà complétée',
  },
  
  // Message
  MESSAGE: {
    UNAUTHORIZED_ACCESS: 'Vous n\'avez pas accès à cette conversation',
    SEND_FAILED: 'Échec de l\'envoi du message',
  },
  
  // Rating
  RATING: {
    REQUEST_NOT_COMPLETED: 'La demande doit être complétée avant de noter',
    ALREADY_RATED: 'Vous avez déjà noté cette demande',
    UNAUTHORIZED: 'Vous ne pouvez noter que les demandes auxquelles vous avez participé',
    INVALID_STARS: 'Le nombre d\'étoiles doit être entre 1 et 5',
  },
  
  // Admin
  ADMIN: {
    FORBIDDEN: 'Accès réservé aux administrateurs',
    USER_NOT_FOUND: 'Utilisateur non trouvé',
    SKILL_NOT_FOUND: 'Compétence non trouvée',
  },
  
  // Common
  COMMON: {
    INTERNAL_ERROR: 'Erreur interne du serveur',
    VALIDATION_FAILED: 'Erreur de validation',
    BAD_REQUEST: 'Requête invalide',
    NOT_FOUND: 'Ressource non trouvée',
  },
};