import random
import math

def get_random_int(min_val, max_val):
    return random.randint(min_val, max_val)

def shuffle_array(arr):
    random.shuffle(arr)
    return arr

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

def generate_skip_counting(step):
    start = get_random_int(1, 5) * step
    sequence = [start, start + step, start + 2 * step, start + 3 * step]
    answer = start + 4 * step
    return {
        "type": "userInput",
        "question": f"Skip count by {step}s: <br/>{', '.join(map(str, sequence))}, ...?",
        "topic": "Number Sense / Skip Counting",
        "answer": str(answer)
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
        if not any(opt["value"] == val for opt in options):
            options.append({"value": val, "label": val})
    shuffle_array(options)
    return {
        "type": "mcq",
        "question": f"Break down the number {number} into tens and ones.",
        "topic": "Number Sense / Place Value",
        "options": options,
        "answer": answer
    }

def generate_comparison(comp_type):
    nums = []
    while len(nums) < 4:
        n = get_random_int(1, 50)
        if n not in nums:
            nums.append(n)
    if comp_type == 'greatest':
        answer = max(nums)
        question_text = "Which number is the greatest?"
    else:
        answer = min(nums)
        question_text = "Which number is the smallest?"
    return {
        "type": "userInput",
        "question": f"{question_text} <br/>[{', '.join(map(str, nums))}]",
        "topic": "Number Sense / Comparison",
        "answer": str(answer)
    }

def generate_even_odd():
    num = get_random_int(1, 20)
    answer = "Even" if num % 2 == 0 else "Odd"
    return {
        "type": "mcq",
        "question": f"Is the number {num} Even or Odd?",
        "topic": "Number Sense / Even & Odd",
        "options": [{"value": "Even", "label": "Even"}, {"value": "Odd", "label": "Odd"}],
        "answer": answer
    }

def generate_before_after():
    num = get_random_int(2, 98)
    comp_type = "before" if random.random() > 0.5 else "after"
    answer = num - 1 if comp_type == "before" else num + 1
    return {
        "type": "userInput",
        "question": f"What number comes {comp_type} {num}?",
        "topic": "Number Sense / Before & After",
        "answer": str(answer)
    }

def generate_between_number():
    num = get_random_int(2, 98)
    answer = num + 1
    return {
        "type": "userInput",
        "question": f"What number comes between {num} and {num + 2}?",
        "topic": "Number Sense / Between",
        "answer": str(answer)
    }

# --- Addition ---

def generate_addition_objects():
    num1 = get_random_int(1, 5)
    num2 = get_random_int(1, 5)
    answer = num1 + num2
    obj = "🍎"
    question = f"Add the apples:<br/> {obj * num1} + {obj * num2} = ?"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Addition / Basics",
        "answer": str(answer)
    }

def generate_addition_word_problems():
    names = ["Raju", "Rama", "Ali", "John"]
    items = ["balls", "apples", "pencils", "books"]
    name = random.choice(names)
    item = random.choice(items)
    num1 = get_random_int(2, 8)
    num2 = get_random_int(1, 5)
    answer = num1 + num2
    question = f"{name} has {num1} {item}. He gets {num2} more. How many {item} does he have now?"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Addition / Word Problems",
        "answer": str(answer)
    }

# --- Subtraction ---

def generate_subtraction_objects():
    num1 = get_random_int(3, 6)
    num2 = get_random_int(1, 2)
    answer = num1 - num2
    obj = "🎈"
    question = f"Subtract the balloons:<br/> {obj * num1} - {obj * num2} = ?"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Subtraction / Basics",
        "answer": str(answer)
    }

def generate_subtraction_word_problems():
    names = ["Raju", "Rama", "Ali", "John"]
    items = ["crayons", "candies", "toys", "stickers"]
    name = random.choice(names)
    item = random.choice(items)
    num1 = get_random_int(6, 10)
    num2 = get_random_int(3, 5)
    answer = num1 - num2
    question = f"{name} had {num1} {item}. He lost {num2}. How many {item} are left?"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Subtraction / Word Problems",
        "answer": str(answer)
    }

# --- Geometry ---

def generate_identify_shapes():
    shapes = [
        {"name": "Circle", "objects": [{"name": "Clock", "img": "⏰"}, {"name": "Coin", "img": "🪙"}]},
        {"name": "Square", "objects": [{"name": "Window", "img": "🪟"}, {"name": "Frame", "img": "🖼️"}]},
        {"name": "Triangle", "objects": [{"name": "Slice of Pizza", "img": "🍕"}, {"name": "Tent", "img": "⛺"}]},
        {"name": "Rectangle", "objects": [{"name": "Door", "img": "🚪"}, {"name": "Book", "img": "📖"}]}
    ]
    shape = random.choice(shapes)
    obj = random.choice(shape["objects"])
    options = shuffle_array([{"value": s["name"], "label": s["name"]} for s in shapes])
    return {
        "type": "mcq",
        "question": f"What shape does a {obj['name']} look like? <br/> <div style=\"font-size: 4rem; margin-top: 10px;\">{obj['img']}</div>",
        "topic": "Geometry / Shapes",
        "options": options,
        "answer": shape["name"]
    }

def generate_spatial():
    concepts = [
        {"type": "Inside/Outside", "question": "In the picture below, is the cat inside or outside the box?", "answer": "Inside", "other": "Outside", "img": "/assets/grade1/cat_inside.jpg"},
        {"type": "Left/Right", "question": "In the picture below, which side is the Yellow Flower?", "answer": "Left", "other": "Right", "img": "/assets/grade1/Flower_left.png"},
        {"type": "Top/Bottom", "question": "Is the sky above (top) or below (bottom) us?", "answer": "Top", "other": "Bottom", "img": "/assets/grade1/sky_top.jpg"}
    ]
    concept = random.choice(concepts)
    options = shuffle_array([{"value": concept["answer"], "label": concept["answer"]}, {"value": concept["other"], "label": concept["other"]}])
    return {
        "type": "mcq",
        "question": f"{concept['question']} <br/> <img src=\"{concept['img']}\" alt=\"{concept['type']}\" style=\"max-width: 300px; margin-top: 10px; border-radius: 8px;\" />",
        "topic": "Geometry / Spatial",
        "options": options,
        "answer": concept["answer"]
    }

# --- Measurement ---

def generate_length_comparison():
    items = [
        {"name": "Pencil", "length": get_random_int(2, 5)},
        {"name": "Table", "length": get_random_int(6, 10)},
        {"name": "Book", "length": get_random_int(5, 8)}
    ]
    item = random.choice(items)
    unit = "handspans"
    answer = f"{item['length']} {unit}"
    options = shuffle_array([
        {"value": answer, "label": answer},
        {"value": f"{item['length'] + 2} {unit}", "label": f"{item['length'] + 2} {unit}"},
        {"value": f"{item['length'] - 1} {unit}", "label": f"{item['length'] - 1} {unit}"},
        {"value": f"{item['length'] + 5} {unit}", "label": f"{item['length'] + 5} {unit}"}
    ])
    return {
        "type": "mcq",
        "question": f"A {item['name']} is about {item['length']} {unit} long. How long is it?",
        "topic": "Measurement / Length",
        "options": options,
        "answer": answer
    }

def generate_weight_comparison():
    comparisons = [
        {"heavy": "Elephant", "light": "Mouse", "img": "/assets/grade1/elephant_mouse.png"},
        {"heavy": "Car", "light": "Bicycle", "img": "/assets/grade1/car_bicycle.png"},
        {"heavy": "Watermelon", "light": "Apple", "img": "/assets/grade1/watermelon_apple.png"},
        {"heavy": "Book", "light": "Feather", "img": "/assets/grade1/book_feather.png"}
    ]
    comp = random.choice(comparisons)
    ask_heavy = random.random() > 0.5
    question = f"Which is {'heavier' if ask_heavy else 'lighter'}: {comp['heavy']} or {comp['light']}?"
    answer = comp["heavy"] if ask_heavy else comp["light"]
    options = shuffle_array([{"value": comp["heavy"], "label": comp["heavy"]}, {"value": comp["light"], "label": comp["light"]}])
    return {
        "type": "mcq",
        "question": f"{question} <br/> <img src=\"{comp['img']}\" alt=\"{comp['heavy']} vs {comp['light']}\" style=\"max-width: 300px; margin-top: 10px; border-radius: 8px;\" />",
        "topic": "Measurement / Weight",
        "options": options,
        "answer": answer
    }

def generate_capacity_comparison():
    comparisons = [
        {"more": "Bucket", "less": "Cup", "img": "/assets/grade1/bucket_cup.png"},
        {"more": "Jug", "less": "Spoon", "img": "/assets/grade1/jug_spoon.png"},
        {"more": "Pool", "less": "Bathtub", "img": "/assets/grade1/pool_bathtub.png"},
        {"more": "Bottle", "less": "Glass", "img": "/assets/grade1/bottle_glass.png"}
    ]
    comp = random.choice(comparisons)
    ask_more = random.random() > 0.5
    question = f"Which holds {'more' if ask_more else 'less'} water:<br/> {comp['more']} or {comp['less']}?"
    answer = comp["more"] if ask_more else comp["less"]
    options = shuffle_array([{"value": comp["more"], "label": comp["more"]}, {"value": comp["less"], "label": comp["less"]}])
    return {
        "type": "mcq",
        "question": f"{question} <br/> <img src=\"{comp['img']}\" alt=\"{comp['more']} vs {comp['less']}\" style=\"max-width: 300px; margin-top: 10px; border-radius: 8px;\" />",
        "topic": "Measurement / Capacity",
        "options": options,
        "answer": answer
    }

# --- Time ---

def generate_time_basics():
    times = [
        {"question": "When do you eat breakfast?", "answer": "Morning", "other": "Evening"},
        {"question": "When do you see stars?", "answer": "Night", "other": "Day"},
        {"question": "When does the sun rise?", "answer": "Morning", "other": "Night"},
        {"question": "When do you eat dinner?", "answer": "Evening", "other": "Morning"}
    ]
    time_data = random.choice(times)
    options = shuffle_array([{"value": time_data["answer"], "label": time_data["answer"]}, {"value": time_data["other"], "label": time_data["other"]}])
    return {
        "type": "mcq",
        "question": time_data["question"],
        "topic": "Time / Basics",
        "options": options,
        "answer": time_data["answer"]
    }

def generate_days_of_week():
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    index = get_random_int(0, 6)
    is_after = random.random() > 0.5
    if is_after:
        question = f"What day comes after {days[index]}?"
        answer = days[(index + 1) % 7]
    else:
        question = f"What day comes before {days[index]}?"
        answer = days[(index - 1) % 7]
    options = shuffle_array([
        {"value": answer, "label": answer},
        {"value": days[(index + 2) % 7], "label": days[(index + 2) % 7]},
        {"value": days[(index + 3) % 7], "label": days[(index + 3) % 7]},
        {"value": days[(index + 4) % 7], "label": days[(index + 4) % 7]}
    ])
    return {
        "type": "mcq",
        "question": question,
        "topic": "Time / Days of Week",
        "options": options,
        "answer": answer
    }

# --- Money ---

def generate_money_counting():
    notes = [1, 2, 5, 10, 20]
    num_notes = get_random_int(2, 4)
    selected_notes = [random.choice(notes) for _ in range(num_notes)]
    total = sum(selected_notes)
    question = f"Count the money:<br/> {' + '.join([f'₹{n}' for n in selected_notes])} = ?"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Money / Basics",
        "answer": str(total)
    }

# --- Patterns ---

def generate_patterns():
    patterns = [
        {"seq": ["A", "B", "A", "B"], "next": "A", "wrong": "B"},
        {"seq": ["1", "2", "1", "2"], "next": "1", "wrong": "2"},
        {"seq": ["🔴", "🔵", "🔴", "🔵"], "next": "🔴", "wrong": "🔵"},
        {"seq": ["🔺", "🔻", "🔺", "🔻"], "next": "🔺", "wrong": "🔻"}
    ]
    pattern = random.choice(patterns)
    question = f"Complete the pattern:<br/> {', '.join(pattern['seq'])}, ...?"
    options = shuffle_array([{"value": pattern["next"], "label": pattern["next"]}, {"value": pattern["wrong"], "label": pattern["wrong"]}])
    return {
        "type": "mcq",
        "question": question,
        "topic": "Patterns / Basics",
        "options": options,
        "answer": pattern["next"]
    }

def generate_sequence_pattern():
    start = get_random_int(1, 10)
    step = get_random_int(1, 2)
    seq = [start, start + step, start + 2 * step, start + 3 * step]
    answer = start + 4 * step
    return {
        "type": "userInput",
        "question": f"Complete the sequence: <br/>{', '.join(map(str, seq))}, ...?",
        "topic": "Patterns / Sequences",
        "answer": str(answer)
    }

# --- Data Handling ---

def create_tally_svg(count):
    height = 50
    spacing = 20
    num_groups = math.ceil(count / 5)
    total_width = num_groups * (40 + spacing)
    svg_lines = ""
    for g in range(num_groups):
        group_x = g * (40 + spacing)
        marks_in_group = min(5, count - g * 5)
        for i in range(min(marks_in_group, 4)):
            x = group_x + i * 10
            svg_lines += f'<line x1="{x}" y1="5" x2="{x}" y2="45" stroke="white" stroke-width="4" stroke-linecap="round" />'
        if marks_in_group == 5:
            svg_lines += f'<line x1="{group_x - 5}" y1="5" x2="{group_x + 35}" y2="45" stroke="white" stroke-width="4" stroke-linecap="round" />'
    return f'<svg width="{total_width}" height="{height}" viewBox="0 0 {total_width} {height}" xmlns="http://www.w3.org/2000/svg" style="display:inline-block; vertical-align:middle; overflow:visible;">{svg_lines}</svg>'

def generate_tally():
    count = get_random_int(1, 10)
    tally_svg = create_tally_svg(count)
    question = f"Count the tally marks:<br/> <div style=\"margin-top: 20px;\">{tally_svg}</div>"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Data Handling / Tally",
        "answer": str(count)
    }

def generate_counting_objects():
    count = get_random_int(2, 10)
    objects = ["🍎", "🍌", "🍇", "🍊", "🍓", "⚽", "🎈", "⭐"]
    selected_object = random.choice(objects)
    question = f"Count the objects: <br/> {selected_object * count}"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Number Sense / Counting Objects",
        "answer": str(count)
    }

def generate_picture_graph():
    count = get_random_int(1, 8)
    question = f"If 1 😃 = 1 fruit, how many fruits are there?<br/> {'😃 ' * count}"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Data Handling / Picture Graph",
        "answer": str(count)
    }

def generate_length_comparison_simple():
    # Helper for GetGrade1Question compatibility if needed
    return generate_length_comparison()

GRADE1_GENERATORS = {
    "Number Sense / Counting Objects": generate_counting_objects,
    "Number Sense / Place Value": generate_place_value,
    "Number Sense / Even & Odd": generate_even_odd,
    "Number Sense / Before & After": generate_before_after,
    "Number Sense / Between": generate_between_number,
    "Number Sense / Counting Forwards": generate_count_forward,
    "Number Sense / Counting Backwards": generate_count_backward,
    "Number Sense / Skip Counting": lambda: generate_skip_counting(random.choice([2, 5, 10])),
    "Number Sense / Comparison": lambda: generate_comparison(random.choice(['smallest', 'greatest'])),
    "Addition / Basics": generate_addition_objects,
    "Addition / Word Problems": generate_addition_word_problems,
    "Subtraction / Basics": generate_subtraction_objects,
    "Subtraction / Word Problems": generate_subtraction_word_problems,
    "Geometry / Shapes": generate_identify_shapes,
    "Geometry / Spatial": generate_spatial,
    "Measurement / Length": generate_length_comparison,
    "Measurement / Weight": generate_weight_comparison,
    "Measurement / Capacity": generate_capacity_comparison,
    "Time / Basics": generate_time_basics,
    "Time / Days of Week": generate_days_of_week,
    "Money / Basics": generate_money_counting,
    "Patterns / Basics": generate_patterns,
    "Patterns / Sequences": generate_sequence_pattern,
    "Data Handling / Tally": generate_tally,
    "Data Handling / Picture Graph": generate_picture_graph
}
