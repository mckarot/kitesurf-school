// src/hooks/__tests__/useCourseCards.test.ts
// Tests unitaires pour le hook useCourseCards

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCourseCards } from '../useCourseCards';
import { db } from '../../db/db';
import type { CourseCard } from '../../types';

describe('useCourseCards', () => {
  beforeEach(async () => {
    // Nettoyer la table avant chaque test
    await db.courseCards.clear();
  });

  describe('Initialisation', () => {
    it('devrait charger avec des cartes vides', async () => {
      const { result } = renderHook(() => useCourseCards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.cards).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('CRUD Operations', () => {
    it('devrait créer une nouvelle CourseCard', async () => {
      const { result } = renderHook(() => useCourseCards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newCard: Omit<CourseCard, 'id' | 'createdAt'> = {
        courseType: 'collectif',
        title: 'Cours Collectif Test',
        description: 'Description test',
        price: 75,
        duration: '2h30',
        maxStudents: 6,
        level: 'Tous niveaux',
        features: ['Feature 1', 'Feature 2'],
        badge: 'Nouveau',
        isHighlighted: 1,
        color: 'from-blue-500 to-cyan-400',
        icon: 'Users',
        isActive: 1,
      };

      const createResult = await result.current.createCard(newCard);

      expect(createResult.success).toBe(true);

      await waitFor(() => {
        expect(result.current.cards.length).toBe(1);
      });

      expect(result.current.cards[0].title).toBe('Cours Collectif Test');
      expect(result.current.cards[0].price).toBe(75);
    });

    it('devrait mettre à jour une CourseCard existante', async () => {
      const { result } = renderHook(() => useCourseCards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Créer une carte
      await result.current.createCard({
        courseType: 'collectif',
        title: 'Cours Original',
        description: 'Description originale',
        price: 70,
        duration: '2h30',
        maxStudents: 6,
        level: 'Tous niveaux',
        features: [],
        isHighlighted: 0,
        color: 'from-blue-500 to-cyan-400',
        icon: 'Users',
        isActive: 1,
      });

      await waitFor(() => {
        expect(result.current.cards.length).toBe(1);
      });

      const card = result.current.cards[0];

      // Mettre à jour la carte
      const updateResult = await result.current.updateCard({
        id: card.id,
        title: 'Cours Modifié',
        price: 80,
      });

      expect(updateResult.success).toBe(true);

      await waitFor(() => {
        expect(result.current.cards[0].title).toBe('Cours Modifié');
        expect(result.current.cards[0].price).toBe(80);
      });
    });

    it('devrait supprimer une CourseCard', async () => {
      const { result } = renderHook(() => useCourseCards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Créer une carte
      await result.current.createCard({
        courseType: 'collectif',
        title: 'Cours à supprimer',
        description: 'Description',
        price: 70,
        duration: '2h30',
        maxStudents: 6,
        level: 'Tous niveaux',
        features: [],
        isHighlighted: 0,
        color: 'from-blue-500 to-cyan-400',
        icon: 'Users',
        isActive: 1,
      });

      await waitFor(() => {
        expect(result.current.cards.length).toBe(1);
      });

      const card = result.current.cards[0];

      // Supprimer la carte
      const deleteResult = await result.current.deleteCard(card.id);

      expect(deleteResult.success).toBe(true);

      await waitFor(() => {
        expect(result.current.cards.length).toBe(0);
      });
    });
  });

  describe('Toggle Operations', () => {
    it('devrait activer/désactiver une CourseCard', async () => {
      const { result } = renderHook(() => useCourseCards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Créer une carte active
      await result.current.createCard({
        courseType: 'collectif',
        title: 'Cours Test',
        description: 'Description',
        price: 70,
        duration: '2h30',
        maxStudents: 6,
        level: 'Tous niveaux',
        features: [],
        isHighlighted: 0,
        color: 'from-blue-500 to-cyan-400',
        icon: 'Users',
        isActive: 1,
      });

      await waitFor(() => {
        expect(result.current.cards.length).toBe(1);
      });

      const card = result.current.cards[0];
      expect(card.isActive).toBe(1);

      // Désactiver la carte
      await result.current.toggleCard(card.id, false);

      await waitFor(() => {
        expect(result.current.cards[0].isActive).toBe(0);
      });

      // Réactiver la carte
      await result.current.toggleCard(card.id, true);

      await waitFor(() => {
        expect(result.current.cards[0].isActive).toBe(1);
      });
    });

    it('devrait activer/désactiver la surbrillance', async () => {
      const { result } = renderHook(() => useCourseCards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Créer une carte sans surbrillance
      await result.current.createCard({
        courseType: 'collectif',
        title: 'Cours Test',
        description: 'Description',
        price: 70,
        duration: '2h30',
        maxStudents: 6,
        level: 'Tous niveaux',
        features: [],
        isHighlighted: 0,
        color: 'from-blue-500 to-cyan-400',
        icon: 'Users',
        isActive: 1,
      });

      await waitFor(() => {
        expect(result.current.cards.length).toBe(1);
      });

      const card = result.current.cards[0];
      expect(card.isHighlighted).toBe(0);

      // Activer la surbrillance
      await result.current.toggleHighlight(card.id, true);

      await waitFor(() => {
        expect(result.current.cards[0].isHighlighted).toBe(1);
      });

      // Désactiver la surbrillance
      await result.current.toggleHighlight(card.id, false);

      await waitFor(() => {
        expect(result.current.cards[0].isHighlighted).toBe(0);
      });
    });
  });

  describe('Getters', () => {
    it('devrait récupérer une carte par son ID', async () => {
      const { result } = renderHook(() => useCourseCards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.createCard({
        courseType: 'collectif',
        title: 'Cours Test',
        description: 'Description',
        price: 70,
        duration: '2h30',
        maxStudents: 6,
        level: 'Tous niveaux',
        features: [],
        isHighlighted: 0,
        color: 'from-blue-500 to-cyan-400',
        icon: 'Users',
        isActive: 1,
      });

      await waitFor(() => {
        expect(result.current.cards.length).toBe(1);
      });

      const card = result.current.cards[0];
      const foundCard = result.current.getCardById(card.id);

      expect(foundCard).toBeDefined();
      expect(foundCard?.title).toBe('Cours Test');
    });

    it('devrait récupérer une carte par son type', async () => {
      const { result } = renderHook(() => useCourseCards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.createCard({
        courseType: 'collectif',
        title: 'Cours Collectif',
        description: 'Description',
        price: 70,
        duration: '2h30',
        maxStudents: 6,
        level: 'Tous niveaux',
        features: [],
        isHighlighted: 0,
        color: 'from-blue-500 to-cyan-400',
        icon: 'Users',
        isActive: 1,
      });

      await waitFor(() => {
        expect(result.current.cards.length).toBe(1);
      });

      const foundCard = result.current.getCardByType('collectif');

      expect(foundCard).toBeDefined();
      expect(foundCard?.courseType).toBe('collectif');
    });
  });

  describe('Refresh', () => {
    it('devrait rafraîchir les cartes manuellement', async () => {
      const { result } = renderHook(() => useCourseCards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Ajouter une carte directement dans la DB
      await db.courseCards.add({
        id: 0,
        courseType: 'particulier',
        title: 'Cours Particulier',
        description: 'Description',
        price: 120,
        duration: '2h30',
        maxStudents: 1,
        level: 'Tous niveaux',
        features: [],
        isHighlighted: 0,
        color: 'from-purple-500 to-pink-400',
        icon: 'User',
        isActive: 1,
        createdAt: Date.now(),
      });

      // Avant refresh, la carte ne devrait pas être dans le state
      expect(result.current.cards.length).toBe(0);

      // Refresh manuel
      await result.current.refreshCards();

      await waitFor(() => {
        expect(result.current.cards.length).toBe(1);
      });

      expect(result.current.cards[0].title).toBe('Cours Particulier');
    });
  });
});
