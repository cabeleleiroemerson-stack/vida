import os
from pathlib import Path
from PyPDF2 import PdfReader
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import pickle
from typing import List, Dict

class WatizatPDFProcessor:
    def __init__(self):
        self.model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        self.index = None
        self.chunks = []
        self.index_path = Path(__file__).parent / 'watizat_index.pkl'
        
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extrai texto do PDF Watizat"""
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    
    def chunk_text(self, text: str, chunk_size: int = 500) -> List[str]:
        """Divide o texto em chunks para embeddings"""
        words = text.split()
        chunks = []
        for i in range(0, len(words), chunk_size):
            chunk = ' '.join(words[i:i+chunk_size])
            chunks.append(chunk)
        return chunks
    
    def create_index(self, pdf_path: str):
        """Cria índice FAISS a partir do PDF"""
        print("Extraindo texto do PDF...")
        text = self.extract_text_from_pdf(pdf_path)
        
        print("Dividindo em chunks...")
        self.chunks = self.chunk_text(text)
        
        print("Criando embeddings...")
        embeddings = self.model.encode(self.chunks)
        
        print("Criando índice FAISS...")
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(embeddings.astype('float32'))
        
        print("Salvando índice...")
        self.save_index()
        print(f"Índice criado com {len(self.chunks)} chunks!")
    
    def save_index(self):
        """Salva o índice em disco"""
        with open(self.index_path, 'wb') as f:
            pickle.dump({
                'index': faiss.serialize_index(self.index),
                'chunks': self.chunks
            }, f)
    
    def load_index(self):
        """Carrega o índice do disco"""
        if not self.index_path.exists():
            return False
        
        with open(self.index_path, 'rb') as f:
            data = pickle.load(f)
            self.index = faiss.deserialize_index(data['index'])
            self.chunks = data['chunks']
        return True
    
    def search(self, query: str, k: int = 3) -> List[str]:
        """Busca os chunks mais relevantes para a query"""
        if self.index is None:
            if not self.load_index():
                return []
        
        query_embedding = self.model.encode([query])
        distances, indices = self.index.search(query_embedding.astype('float32'), k)
        
        results = [self.chunks[idx] for idx in indices[0]]
        return results

if __name__ == "__main__":
    processor = WatizatPDFProcessor()
    pdf_path = "/tmp/watizat.pdf"
    
    if Path(pdf_path).exists():
        processor.create_index(pdf_path)
    else:
        print(f"PDF não encontrado em {pdf_path}")
