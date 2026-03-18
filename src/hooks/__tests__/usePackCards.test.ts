// src/hooks/__tests__/usePackCards.test.ts
// Tests unitaires pour le hook usePackCards

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePackCards } from '../usePackCards';
import { db } from '../../db/db';
import type { PackCard } from '../../types';

describe('usePackCards', () => {
  beforeEach(async () => {
    // Nettoyer la table avant chaque test
    await db.packCards.clear();
  });

  describe('Initialisation', () => {
    it('devrait charger avec des cartes vides', async () => {
      const { result } = renderHook(() => usePackCards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.cards).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('CRUD Operations', () => {
    it('devrait créer une nouvelle PackCard', async () => {
      const { result } = renderHook(() => usePackCards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newCard: Omit<PackCard, 'id' | 'createdAt'> = {
        packType: 'pack_3',
        title: 'Pack Découverte Test',
        description: 'Description test',
        sessions: 3,
        price: 180,
        originalPrice: 210,
        discount: 30,
        features: ['Feature 1', 'Feature 2'],
        badge: 'Nouveau',
        isHighlighted: 1,
        isActive: 1,
        color: 'from-purple-500 to-pink-500',
        icon: 'Star',
      };

      const createResult = await result.current.createCard(newCard);

      expect(createResult.success).toBe(true);

      await waitFor(() => {
        expect(result.current.cards.length).toBe(1);
      });

      expect(result.current.cards[0].title).toBe('Pack Découverte Test');
      expect(result.current.cards[0].price).toBe(180);
      expect(result.current.cards[0].sessions).toBe(3);
    });

    it('devrait mettre à jour une PackCard existante', async () => {
      const { result } = renderHook(() => usePackCards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Créer une carte
      await result.current.createCard({
        packType: 'pack_3',
        title: 'Pack Original',
        description: 'Description originale',
        sessions: 3,
        price: 180,
        originalPrice: 210,
        discount: 30,
        features: [],
        isHighlighted: 0,
        isActive: 1,
        color: 'from-purple-500 to-pink-500',
        icon: 'Star',
      });

      await waitFor(() => {
        expect(result.current.cards.length).toBe(1);
      });

      const card = result.current.cards[0];

      // Mettre à jour la carte
      const updateResult = await result.current.updateCard({
        id: card.id,
        title: 'Pack Modifié',
        price: 170,
      });

      expect(updateResult.success).toBe(true);

      await waitFor(() => {
        expect(result.current.cards[0].title).toBe('Pack Modifié');
        expect(result.current.cards[0].price).toBe(170);
      });
    });

    it('devrait supprimer une PackCard', async () => {
      const { result } = renderHook(() => usePackCards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Créer une carte
      await result.current.createCard({
        packType: 'pack_3',
        title: 'Pack à supprimer',
        description: 'Description',
        sessions: 3,
        price: 180,
        originalPrice: 210,
        discount: 30,
        features: [],
        isHighlighted: 0,
        isActive: 1,
        color: 'from-purple-500 to-pink-500',
        icon: 'Star',
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
    it('devrait activer/désactiver une PackCard', async () => {
      const { result } = renderHook(() => usePackCards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Créer une carte active
      await result.current.createCard({
        packType: 'pack_3',
        title: 'Pack Test',
        description: 'Description',
        sessions: 3,
        price: 180,
        originalPrice: 210,
        discount: 30,
        features: [],
        isHighlighted: 0,
        isActive: 1,
        color: 'from-purple-500 to-pink-500',
        icon: 'Star',
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
      const { result } = renderHook(() => usePackCards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Créer une carte sans surbrillance
      await result.current.createCard({
        packType: 'pack_3',
        title: 'Pack Test',
        description: 'Description',
        sessions: 3,
        price: 180,
        originalPrice: 210,
        discount: 30,
        features: [],
        isHighlighted: 0,
        isActive: 1,
        color: 'from-purple-500 to-pink-500',
        icon: 'Star',
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
      const { result } = renderHook(() => usePackCards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.createCard({
        packType: 'pack_3',
        title: 'Pack Test',
        description: 'Description',
        sessions: 3,
        price: 180,
        originalPrice: 210,
        discount: 30,
        features: [],
        isHighlighted: 0,
        isActive: 1,
        color: 'from-purple-500 to-pink-500',
        icon: 'Star',
      });

      await waitFor(() => {
        expect(result.current.cards.length).toBe(1);
      });

      const card = result.current.cards[0];
      const foundCard = result.current.getCardById(card.id);

      expect(foundCard).toBeDefined();
      expect(foundCard?.title).toBe('Pack Test');
    });

    it('devrait récupérer une carte par son type', async () => {
      const { result } = renderHook(() => usePackCards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.createCard({
        packType: 'pack_3',
        title: 'Pack Découverte',
        description: 'Description',
        sessions: 3,
        price: 180,
        originalPrice: 210,
        discount: 30,
        features: [],
        isHighlighted: 0,
        isActive: 1,
        color: 'from-purple-500 to-pink-500',
        icon: 'Star',
      });

      await waitFor(() => {
        expect(result.current.cards.length).toBe(1);
      });

      const foundCard = result.current.getCardByType('pack_3');

      expect(foundCard).toBeDefined();
      expect(foundCard?.packType).toBe('pack_3');
    });
  });

  describe('Refresh', () => {
    it('devrait rafraîchir les cartes manuellement', async () => {
      const { result } = renderHook(() => usePackCards());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Ajouter une carte directement dans la DB
      await db.packCards.add({
        id: 0,
        packType: 'pack_6',
        title: 'Pack Progression',
        description: 'Description',
        sessions: 6,
        price: 330,
        originalPrice: 420,
        discount: 90,
        features: [],
        isHighlighted: 1,
        isActive: 1,
        createdAt: Date.now(),
        color: 'from-purple-500 to-pink-500',
        icon: 'Award',
      });

      // Avant refresh, la carte ne devrait pas être dans le state
      expect(result.current.cards.length).toBe(0);

      // Refresh manuel
      await result.current.refreshCards();

      await waitFor(() => {
        expect(result.current.cards.length).toBe(1);
      });

      expect(result.current.cards[0].title).toBe('Pack Progression');
      expect(result.current.cards[0].sessions).toBe(6);
    });
  });
});
