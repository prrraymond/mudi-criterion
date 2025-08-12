import os
import google.generativeai as genai
from supabase import create_client, Client
from dotenv import load_dotenv

# --- Configuration for Test Mode ---
TEST_MODE = True  # Set to False to run the full batch job
TEST_LIMIT = 20   # Number of movies to process in test mode

# Load environment variables from .env file
load_dotenv(".env.local")

# --- Database Setup ---
url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

# --- Gemini API Setup ---
gemini_api_key = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=gemini_api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

# --- Your Refined Emotions and Reasons Data ---
reasonsBySpecificMood = {
  # HIGH ENERGY + PLEASANT
  "excited": [
    "Upcoming event or opportunity",
    "New adventure or travel plans", 
    "Anticipating a special occasion",
    "Starting something new and challenging",
    "Breakthrough or discovery",
    "Romantic anticipation or attraction"
  ],
  
  "happy": [
    "Recent accomplishment or success",
    "Positive social interaction",
    "Receiving good news",
    "Feeling appreciated or loved",
    "Beautiful weather or environment",
    "Spontaneous joy or gratitude"
  ],
  
  "energetic": [
    "Good physical health and vitality",
    "Productive morning routine",
    "Exercise or physical activity",
    "Caffeine or natural energy boost",
    "Motivated by clear goals",
    "Feeling physically strong and capable"
  ],

  # HIGH ENERGY + UNPLEASANT
  "angry": [
    "Injustice or unfair treatment",
    "Boundaries being violated",
    "Feeling disrespected or dismissed",
    "Blocked goals or thwarted plans",
    "Witnessing wrongdoing",
    "Betrayal or broken trust"
  ],
  
  "anxious": [
    "Uncertainty about the future",
    "Important upcoming decision",
    "Fear of failure or judgment",
    "Health or safety concerns",
    "Social performance pressure",
    "Financial or security worries"
  ],
  
  "stressed": [
    "Multiple competing deadlines",
    "Overwhelming workload",
    "Time pressure and rushing",
    "Juggling too many responsibilities",
    "Difficult decision-making",
    "Pressure to meet expectations"
  ],

  # LOW ENERGY + PLEASANT
  "calm": [
    "Meditation or mindfulness practice",
    "Resolved conflict or problem",
    "Peaceful natural environment",
    "Sense of safety and security",
    "Deep breathing or relaxation",
    "Spiritual or philosophical reflection"
  ],
  
  "content": [
    "Acceptance of current circumstances",
    "Gratitude for what you have",
    "Feeling fulfilled in relationships",
    "Pride in personal progress",
    "Simple pleasures and comforts",
    "Alignment with personal values"
  ],
  
  "relaxed": [
    "End of a stressful period",
    "Comfortable physical environment",
    "Quality rest or leisure time",
    "Massage or physical relief",
    "Vacation or break from routine",
    "Letting go of control or worry"
  ],

  # LOW ENERGY + UNPLEASANT
  "sad": [
    "Loss or grief",
    "Disappointment in outcomes", 
    "Feeling misunderstood or alone",
    "Nostalgia or missing someone",
    "Empathy for others' suffering",
    "Unmet emotional needs"
  ],
  
  "tired": [
    "Physical or mental exhaustion",
    "Poor sleep quality or insomnia",
    "Emotional burnout",
    "Chronic stress effects",
    "Overcommitment and depletion",
    "Seasonal energy changes"
  ],
  
  "bored": [
    "Lack of mental stimulation",
    "Repetitive routine or monotony",
    "Underutilization of skills",
    "Absence of meaningful challenges",
    "Social isolation or understimulation",
    "Lack of purpose or direction"
  ]
}

# --- The Final, Refined Prompt ---
# --- The Final, Refined Prompt ---
def generate_recommendation_prompt(movie_title, movie_synopsis, emotion, reason):
    """
    Generates the full prompt for the Gemini API call with a subtle tone.
    """
    return f"""
    You are an expert film critic writing for The Cut. Your task is to write a compelling one-sentence recommendation for a film, tailored to a user's specific emotional state.

    **Context:**
    - The film is: {movie_title}
    - Its synopsis is: {movie_synopsis}
    - The user's mood is: {emotion}
    - The specific reason for their mood is: {reason}

    **Instructions:**
    1. Write a single, compelling sentence (25 words or less) that explains why this film would resonate with the user. The recommendation should subtly speak to their emotional state without explicitly naming the emotion or reason.
    2. Your output should be just this single sentence, without any extra commentary.
    3. If the film is not a good fit for this specific emotional state, or if the connection is very weak, return the exact phrase "N/A" instead of a sentence.
    """
def get_movies_from_db():
    """
    Fetches movies from the 'movies' table in Supabase,
    applying a limit if TEST_MODE is enabled.
    """
    print("Fetching movies from Supabase...")
    if TEST_MODE:
        print(f"*** TEST MODE ENABLED: Limiting to {TEST_LIMIT} movies. ***")
        response = supabase.from_('movies').select('id, title, synopsis').limit(TEST_LIMIT).execute()
    else:
        response = supabase.from_('movies').select('id, title, synopsis').execute()
        
    if response.data:
        return response.data
    return []

def save_recommendation_to_db(movie_id, emotion, reason, recommendation_text):
    """
    Saves a generated recommendation to a new 'recommendations' table.
    """
    data_to_insert = {
        "movie_id": movie_id,
        "emotion": emotion,
        "reason": reason,
        "recommendation_text": recommendation_text
    }
    supabase.from_('recommendations').insert(data_to_insert).execute()

def main_workflow():
    """
    The main logic to orchestrate the entire process.
    """
    movies = get_movies_from_db()
    if not movies:
        print("No movies found. Exiting.")
        return

    print(f"Found {len(movies)} movies. Starting recommendation generation...")
    
    for movie in movies:
        movie_id = movie['id']
        movie_title = movie['title']
        movie_synopsis = movie['synopsis']

        for emotion, reasons in reasonsBySpecificMood.items():
            for reason in reasons:
                prompt_text = generate_recommendation_prompt(movie_title, movie_synopsis, emotion, reason)
                
                try:
                    response = model.generate_content(prompt_text)
                    recommendation = response.text.strip()
                    
                    if recommendation != "N/A":
                        print(f"✅ Generated for '{movie_title}' ({emotion}/{reason}): {recommendation}")
                        save_recommendation_to_db(movie_id, emotion, reason, recommendation)
                    else:
                        print(f"❌ Skipping for '{movie_title}' ({emotion}/{reason}): Not a strong match.")
                except Exception as e:
                    print(f"⚠️ An error occurred for '{movie_title}' ({emotion}/{reason}): {e}")

    print("Workflow complete!")

if __name__ == "__main__":
    main_workflow()