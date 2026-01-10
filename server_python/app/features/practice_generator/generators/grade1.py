import random

def get_random_int(min_val, max_val):
    return random.randint(min_val, max_val)

def shuffle_options(options):
    random.shuffle(options)
    return options

# --- Number Sense ---

def generate_count_forward():
    start = get_random_int(1, 15)
    sequence = [start, start + 1, start + 2, start + 3]
    answer = start + 4
    
    return {
        "type": "userInput",
        "question": f"What comes next: {', '.join(map(str, sequence))}, ...?",
        "topic": "Number Sense / Counting",
        "answer": str(answer)
    }

def generate_count_backward():
    start = get_random_int(10, 20)
    sequence = [start, start - 1, start - 2, start - 3]
    answer = start - 4
    
    return {
        "type": "userInput",
        "question": f"Count backwards: <br/> {', '.join(map(str, sequence))}, ...?",
        "topic": "Number Sense / Counting",
        "answer": str(answer)
    }

def generate_skip_counting_2():
    return _generate_skip_counting(2)

def generate_skip_counting_5():
    return _generate_skip_counting(5)

def generate_skip_counting_10():
    return _generate_skip_counting(10)

def _generate_skip_counting(step):
    start = get_random_int(1, 5) * step
    sequence = [start, start + step, start + 2 * step, start + 3 * step]
    answer = start + 4 * step
    
    # 50% chance user input
    if random.random() > 0.5:
        return {
             "type": "userInput",
             "question": f"Skip count by {step}s: <br/>{', '.join(map(str, sequence))}, ...?",
             "topic": "Number Sense / Skip Counting",
             "answer": str(answer)
        }
    
    options = [
        {"value": str(answer), "label": str(answer)},
        {"value": str(answer + step), "label": str(answer + step)},
        {"value": str(answer - step), "label": str(answer - step)},
        {"value": str(answer + 2 * step), "label": str(answer + 2 * step)}
    ]
    shuffle_options(options)
    
    return {
        "type": "userInput", # JS was returning userInput even for MC options? Checked code: yes it was returning userInput but commented out MCQ. Wait, the JS code returns userInput at the end too. I'll stick to userInput as per JS.
        "question": f"Skip count by {step}s: {', '.join(map(str, sequence))}, ...?",
        "topic": "Number Sense / Skip Counting",
        "answer": str(answer),
        # "options": options # Consistently logic
    }

def generate_place_value():
    tens = get_random_int(1, 9)
    ones = get_random_int(0, 9)
    number = tens * 10 + ones
    answer = f"{tens} tens and {ones} ones"
    
    options = [{"value": answer, "label": answer}]
    
    while len(options) < 4:
        t = get_random_int(1, 9)
        o = get_random_int(0, 9)
        val = f"{t} tens and {o} ones"
        if not any(opt['value'] == val for opt in options):
            options.append({"value": val, "label": val})
            
    shuffle_options(options)
    
    return {
        "type": "mcq",
        "question": f"Break down the number {number} into tens and ones.",
        "topic": "Number Sense / Place Value",
        "options": options,
        "answer": answer
    }

def generate_comparison():
    # Randomly choose between smallest or greatest
    type_ = 'greatest' if random.random() > 0.5 else 'smallest'
    
    nums = []
    while len(nums) < 4:
        n = get_random_int(1, 50)
        if n not in nums:
            nums.append(n)
            
    if type_ == 'greatest':
        answer = max(nums)
        q_text = "Which number is the greatest?"
    else:
        answer = min(nums)
        q_text = "Which number is the smallest?"
        
    options = [{"value": str(n), "label": str(n)} for n in nums]
    shuffle_options(options)
    
    return {
        "type": "mcq",
        "question": f"{q_text} [{', '.join(map(str, nums))}]",
        "topic": "Number Sense / Comparison",
        "options": options,
        "answer": str(answer)
    }

def generate_addition_objects():
    num1 = get_random_int(1, 5)
    num2 = get_random_int(1, 5)
    answer = num1 + num2
    
    obj = "🍎"
    question = f"Add the apples:<br/> {obj * num1} + {obj * num2} = ?"
    
    if random.random() > 0.5:
        return {
            "type": "userInput",
            "question": question,
            "topic": "Addition / Basics",
            "answer": str(answer)
        }
        
    options = [
        {"value": str(answer), "label": str(answer)},
        {"value": str(answer + 1), "label": str(answer + 1)},
        {"value": str(answer - 1), "label": str(answer - 1)},
        {"value": str(answer + 2), "label": str(answer + 2)}
    ]
    shuffle_options(options)
    
    return {
        "type": "mcq",
        "question": question,
        "topic": "Addition / Basics",
        "options": options,
        "answer": str(answer)
    }

def generate_subtraction_objects():
    num1 = get_random_int(3, 6)
    num2 = get_random_int(1, 2)
    answer = num1 - num2
    
    obj = "🎈"
    question = f"Subtract the balloons:<br/> {obj * num1} - {obj * num2} = ?"
    
    if random.random() > 0.5:
        return {
             "type": "userInput",
             "question": question,
             "topic": "Subtraction / Basics",
             "answer": str(answer)
        }
        
    options = [
        {"value": str(answer), "label": str(answer)},
        {"value": str(answer + 1), "label": str(answer + 1)},
        {"value": str(answer - 1), "label": str(answer - 1)},
        {"value": str(answer + 2), "label": str(answer + 2)}
    ]
    shuffle_options(options)
    
    return {
        "type": "mcq",
        "question": question,
        "topic": "Subtraction / Basics",
        "options": options,
        "answer": str(answer)
    }

GENERATOR_MAP = {
    "Number Sense / Counting": generate_count_forward, # Default to forward
    "Number Sense / Counting Forwards": generate_count_forward,
    "Number Sense / Counting Backwards": generate_count_backward,
    "Number Sense / Skip Counting": generate_skip_counting_2, # Default
    "Number Sense / Place Value": generate_place_value,
    "Number Sense / Comparison": generate_comparison,
    "Addition / Basics": generate_addition_objects,
    "Subtraction / Basics": generate_subtraction_objects,
    # Add more as needed
}
