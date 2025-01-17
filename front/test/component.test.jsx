import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect } from 'chai';
import MyComponent from './MyComponent';

describe('<MyComponent />', () => {
  it('affiche le texte correct', () => {
    render(<MyComponent text="Bonjour, React !" />);
    const element = screen.getByText('Bonjour, React !');
    expect(element).to.exist;
  });

  it('contient une classe CSS spécifique', () => {
    render(<MyComponent text="Bonjour, React !" />);
    const element = screen.getByText('Bonjour, React !');
    expect(element.className).to.include('my-class');
  });
});