import random
import math
import base64

def get_random_int(min_val, max_val):
    return random.randint(min_val, max_val)

def shuffle_array(array):
    random.shuffle(array)
    return array

# --- Number Sense & Operations ---

def generate_place_value_5digit():
    num = get_random_int(10000, 99999)
    num_str = str(num)
    pos = get_random_int(0, 4)
    while num_str[pos] == '0':
        pos = get_random_int(0, 4)
    digit = num_str[pos]
    places = ["Ten Thousands", "Thousands", "Hundreds", "Tens", "Ones"]
    values = [10000, 1000, 100, 10, 1]
    place_value = int(digit) * values[pos]
    question = f"What is the place value of the digit {digit} in the {places[pos]} place of {num}?"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Number Sense / Place Value",
        "answer": str(place_value)
    }

def generate_place_value_5digit_visual():
    num = get_random_int(10000, 99999)
    num_str = str(num)
    pos = get_random_int(0, 4)
    while num_str[pos] == '0':
        pos = get_random_int(0, 4)
    digit = num_str[pos]
    places = ["Ten Thousands", "Thousands", "Hundreds", "Tens", "Ones"]
    values = [10000, 1000, 100, 10, 1]
    place_value = int(digit) * values[pos]
    
    width = 550
    height = 120
    cell_width = 100
    cell_height = 50
    padding = 10
    
    svg_parts = [
        f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">',
        '<rect width="100%" height="100%" fill="white" />'
    ]
    for i in range(5):
        x = padding + i * cell_width
        y = 20
        fill_color = "#f4a261" if i == pos else "#a8dadc"
        svg_parts.append(f'<rect x="{x}" y="{y}" width="{cell_width}" height="{cell_height}" fill="{fill_color}" stroke="#1d3557" stroke-width="2"/>')
        svg_parts.append(f'<text x="{x + cell_width / 2}" y="{y + cell_height / 2 + 6}" font-family="Arial" font-size="20" font-weight="bold" text-anchor="middle">{num_str[i]}</text>')
        svg_parts.append(f'<text x="{x + cell_width / 2}" y="{y + cell_height + 20}" font-family="Arial" font-size="14" text-anchor="middle">{places[i]}</text>')
    svg_parts.append('</svg>')
    
    svg_string = ''.join(svg_parts)
    base64_svg = base64.b64encode(svg_string.encode()).decode()
    image_path = f"data:image/svg+xml;base64,{base64_svg}"
    
    return {
        "type": "userInput",
        "topic": "Number Sense / Place Value",
        "question": "Look at the table below and find the place value of the highlighted digit.",
        "answer": str(place_value),
        "image": image_path
    }

def generate_expanded_form():
    num = get_random_int(1000, 9999)
    num_str = str(num)
    parts = []
    for i in range(len(num_str)):
        digit = num_str[i]
        if digit != '0':
            parts.append(f"{digit}{'0' * (len(num_str) - 1 - i)}")
    answer = " + ".join(parts)
    question = f"Write the expanded form of {num}."
    
    dist1 = " + ".join(parts).replace("00", "0")
    dist2 = " - ".join(parts)
    parts_wrong = list(parts)
    if len(parts_wrong) > 1:
        parts_wrong[-1] = parts_wrong[-1] + "0"
    dist3 = " + ".join(parts_wrong)
    
    options = shuffle_array([
        {"value": answer, "label": answer},
        {"value": dist1, "label": dist1},
        {"value": dist3, "label": dist3},
        {"value": str(num), "label": str(num)}
    ])
    return {
        "type": "mcq",
        "question": question,
        "topic": "Number Sense / Expanded Form",
        "options": options,
        "answer": answer
    }

def generate_addition_4digit():
    num1 = get_random_int(1000, 5000)
    num2 = get_random_int(1000, 4999)
    if (num1 % 10) + (num2 % 10) < 10:
        return generate_addition_4digit()
    answer = num1 + num2
    return {
        "type": "userInput",
        "question": f"Add: $$ {num1} + {num2} = ? $$",
        "topic": "Addition / With Carry",
        "answer": str(answer)
    }

def generate_addition_4digit_application():
    num1 = get_random_int(1000, 5000)
    num2 = get_random_int(1000, 4999)
    if (num1 % 10) + (num2 % 10) < 10:
        return generate_addition_4digit_application()
    scenarios = [
        f"You bought a toy for ${num1}$ and a storybook for ${num2}$ How much did you spend?",
        f"You bought pencils for ${num1}$ and crayons for ${num2}$ What is the total cost?",
        f"You bought a backpack for ${num1}$ and a water bottle for ${num2}$ How much did you pay altogether?",
        f"You bought chocolates for ${num1}$ and ice cream for ${num2}$ How much did you spend in total?",
        f"You bought shoes for ${num1}$ and socks for ${num2}$ How much is the total?",
        f"You bought a football for ${num1}$ and a jersey for ${num2}$ What is the total amount?",
        f"You bought notebooks for ${num1}$ and a lunch box for ${num2}$ How much did you spend?",
        f"You bought a puzzle for ${num1}$ and a coloring book for ${num2}$ What is the total?",
        f"You bought stickers for ${num1}$ and markers for ${num2}$ How much did you spend altogether?",
        f"You bought a teddy bear for ${num1}$ and a toy car for ${num2}$ What is the total cost?"
    ]
    question = random.choice(scenarios)
    answer = num1 + num2
    return {
        "type": "userInput",
        "topic": "Addition / With Carry",
        "question": question,
        "answer": str(answer)
    }

def generate_subtraction_4digit():
    num1 = get_random_int(5000, 9999)
    num2 = get_random_int(1000, 4999)
    if (num1 % 10) >= (num2 % 10):
        return generate_subtraction_4digit()
    answer = num1 - num2
    return {
        "type": "userInput",
        "question": f"Subtract: $$ {num1} - {num2} = ? $$",
        "topic": "Subtraction / With Borrow",
        "answer": str(answer)
    }

def generate_subtraction_4digit_application():
    num1 = get_random_int(5000, 9999)
    num2 = get_random_int(1000, 4999)
    if (num1 % 10) >= (num2 % 10):
        return generate_subtraction_4digit_application()
    scenarios = [
        f"You had {num1} stickers. You gave {num2} stickers to your friend. How many stickers are left?",
        f"A shop had {num1} pencils. It sold {num2} pencils. How many pencils remain?",
        f"A library had {num1} books. After students borrowed {num2} books, how many books are still there?",
        f"You collected {num1} coins. You spent {num2} coins. How many coins do you have now?",
        f"There were {num1} visitors at a park. {num2} visitors left. How many visitors are still in the park?",
        f"A farmer had {num1} apples. He sold {num2} apples. How many apples are left?",
        f"Your school printed {num1} worksheets. Teachers used {num2} worksheets. How many are left?",
        f"A toy store had {num1} balloons. {num2} balloons flew away. How many balloons remain?",
        f"You walked {num1} steps today. You rested after {num2} steps. How many more steps are needed?",
        f"A museum had {num1} tickets available. {num2} tickets were sold. How many tickets remain?"
    ]
    question = random.choice(scenarios)
    answer = num1 - num2
    return {
        "type": "userInput",
        "topic": "Subtraction / With Borrow",
        "question": question,
        "answer": str(answer)
    }

def generate_multiplication():
    m_type = "3x1" if random.random() > 0.5 else "2x2"
    if m_type == "3x1":
        num1 = get_random_int(100, 999)
        num2 = get_random_int(2, 9)
    else:
        num1 = get_random_int(10, 99)
        num2 = get_random_int(10, 99)
    answer = num1 * num2
    return {
        "type": "userInput",
        "question": f"Multiply: $$ {num1} × {num2} = ? $$",
        "topic": "Number Sense / Multiplication",
        "answer": str(answer)
    }

def generate_multiplication_application():
    num1 = get_random_int(10, 99)
    num2 = get_random_int(10, 99)
    scenarios = [
        f"Each box has {num1} chocolates. If you buy {num2} boxes, how many chocolates do you have in total?",
        f"A teacher printed {num1} worksheets for each class. There are {num2} classes. How many worksheets did she print?",
        f"You collected {num1} stickers each day for {num2} days. How many stickers did you collect in total?",
        f"A garden has {num1} rows of plants and {num2} plants in each row. How many plants are there altogether?",
        f"A toy shop packs {num1} toys in one carton. If it has {num2} cartons, how many toys are there?",
        f"A school bought {num1} pencils for each student. There are {num2} students. How many pencils were bought in total?",
        f"A farmer planted {num1} seeds in each row. He made {num2} rows. How many seeds did he plant?",
        f"Each notebook has {num1} pages. If you buy {num2} notebooks, how many pages do you have?",
        f"You read {num1} pages each day for {num2} days. How many pages did you read?",
        f"A box has {num1} marbles. You bought {num2} boxes. How many marbles do you have altogether?"
    ]
    question = random.choice(scenarios)
    answer = num1 * num2
    return {
        "type": "userInput",
        "topic": "Multiplication / 2-digit × 2-digit",
        "question": question,
        "answer": str(answer)
    }

def generate_division():
    divisor = get_random_int(2, 9)
    quotient = get_random_int(100, 500)
    dividend = divisor * quotient
    return {
        "type": "userInput",
        "question": f"Divide: $$ \\frac{{{dividend}}}{{{divisor}}} = ? $$",
        "topic": "Number Sense / Division",
        "answer": str(quotient)
    }

def generate_division_application():
    divisor = get_random_int(2, 9)
    quotient = get_random_int(10, 99)
    dividend = divisor * quotient
    scenarios = [
        f"You have {dividend} candies. You want to share them equally among {divisor} friends. How many candies does each friend get?",
        f"A teacher has {dividend} stickers. She divides them equally among {divisor} students. How many stickers does each student get?",
        f"A farmer collected {dividend} apples. He packed them equally into {divisor} baskets. How many apples go in each basket?",
        f"There are {dividend} pages to read in a book. You want to read the same number of pages for {divisor} days. How many pages will you read each day?",
        f"A shopkeeper has {dividend} balloons. He ties them into groups of {divisor}. How many groups can he make?",
        f"A library has {dividend} books to arrange. The bookshelves hold equal numbers and there are {divisor} shelves. How many books go on each shelf?",
        f"You collected {dividend} coins and want to put them equally into {divisor} jars. How many coins go in each jar?",
        f"A box has {dividend} crayons. You want to pack them into sets of {divisor}. How many crayons are in each set?",
        f"A class folded {dividend} paper airplanes. They divide them equally among {divisor} teams. How many airplanes does each team get?",
        f"A baker made {dividend} cookies and packed them equally into {divisor} boxes. How many cookies go in each box?"
    ]
    question = random.choice(scenarios)
    return {
        "type": "userInput",
        "topic": "Division / 3-digit ÷ 1-digit",
        "question": question,
        "answer": str(quotient)
    }

def generate_estimation():
    num1 = get_random_int(100, 900)
    num2 = get_random_int(100, 900)
    round1 = round(num1 / 100) * 100
    round2 = round(num2 / 100) * 100
    estimated_sum = round1 + round2
    question = f"Estimate the sum of {num1} and {num2} by rounding to the nearest 100."
    return {
        "type": "userInput",
        "question": question,
        "topic": "Number Sense / Estimation",
        "answer": str(estimated_sum)
    }

def gcd_func(a, b):
    while b:
        a, b = b, a % b
    return a

def generate_lcm():
    num1 = get_random_int(2, 10)
    num2 = get_random_int(2, 10)
    lcm = abs(num1 * num2) // gcd_func(num1, num2)
    return {
        "type": "userInput",
        "topic": "Number Sense / LCM",
        "question": f"Find the LCM of {num1} and {num2}.",
        "answer": str(lcm)
    }

# --- Fractions ---

def generate_proper_improper_fractions():
    types = ["Proper Fraction", "Improper Fraction"]
    f_type = random.choice(types)
    if f_type == "Proper Fraction":
        image_num = get_random_int(1, 4)
        image_path = f"/assets/grade4/proper_fraction_{image_num}.png"
        answer = "Proper Fraction"
    else:
        image_num = get_random_int(1, 3)
        image_path = f"/assets/grade4/improper_fraction_{image_num}.png"
        answer = "Improper Fraction"
    
    options = shuffle_array([
        {"value": "Proper Fraction", "label": "Proper Fraction"},
        {"value": "Improper Fraction", "label": "Improper Fraction"},
        {"value": "Mixed Fraction", "label": "Mixed Fraction"},
        {"value": "Unit Fraction", "label": "Unit Fraction"}
    ])
    return {
        "type": "mcq",
        "question": "Identify the type of fraction shown in the image:",
        "topic": "Fractions / Types",
        "options": options,
        "answer": answer,
        "image": image_path
    }

def generate_mixed_unit_fractions():
    types = ["Mixed Fraction", "Unit Fraction"]
    f_type = random.choice(types)
    if f_type == "Mixed Fraction":
        image_num = get_random_int(1, 3)
        image_path = f"/assets/grade4/mixed_fraction_{image_num}.png"
        answer = "Mixed Fraction"
    else:
        image_num = get_random_int(1, 4)
        image_path = f"/assets/grade4/unit_fraction_{image_num}.png"
        answer = "Unit Fraction"
        
    options = shuffle_array([
        {"value": "Proper Fraction", "label": "Proper Fraction"},
        {"value": "Improper Fraction", "label": "Improper Fraction"},
        {"value": "Mixed Fraction", "label": "Mixed Fraction"},
        {"value": "Unit Fraction", "label": "Unit Fraction"}
    ])
    return {
        "type": "mcq",
        "question": "Identify the type of fraction shown in the image",
        "topic": "Fractions / Types",
        "options": options,
        "answer": answer,
        "image": image_path
    }

def generate_fraction_operations():
    den = get_random_int(3, 12)
    num1 = get_random_int(1, den - 2)
    num2 = get_random_int(1, den - num1 - 1)
    is_addition = random.random() > 0.5
    if is_addition:
        answer_num = num1 + num2
        question = f"Solve: $$ \\frac{{{num1}}}{{{den}}} + \\frac{{{num2}}}{{{den}}} = ? $$"
    else:
        n1, n2 = max(num1, num2), min(num1, num2)
        answer_num = n1 - n2
        question = f"Solve: $$ \\frac{{{n1}}}{{{den}}} - \\frac{{{n2}}}{{{den}}} = ? $$"
    
    answer = f"$$ \\frac{{{answer_num}}}{{{den}}} $$"
    options = shuffle_array([
        {"value": answer, "label": answer},
        {"value": f"$$ \\frac{{{answer_num + 1}}}{{{den}}} $$", "label": f"$$ \\frac{{{answer_num + 1}}}{{{den}}} $$"},
        {"value": f"$$ \\frac{{{answer_num}}}{{{den + 1}}} $$", "label": f"$$ \\frac{{{answer_num}}}{{{den + 1}}} $$"},
        {"value": f"$$ \\frac{{{den}}}{{{answer_num}}} $$", "label": f"$$ \\frac{{{den}}}{{{answer_num}}} $$"}
    ])
    return {
        "type": "mcq",
        "question": question,
        "topic": "Fractions / Operations",
        "options": options,
        "answer": answer
    }

# --- Geometry ---

def generate_angles():
    types = ["Acute", "Obtuse", "Right", "Straight"]
    a_type = random.choice(types)
    if a_type == "Acute":
        image_num = get_random_int(1, 3)
        image_path = f"/assets/grade4/acute_angle_{image_num}.png"
    elif a_type == "Obtuse":
        image_num = get_random_int(1, 3)
        image_path = f"/assets/grade4/obtuse_angle_{image_num}.png"
    elif a_type == "Right":
        image_num = get_random_int(1, 2)
        image_path = f"/assets/grade4/right_angle_{image_num}.png"
    else:
        image_path = "/assets/grade4/straight_angle_1.png"
        
    options = shuffle_array([
        {"value": "Acute", "label": "Acute"},
        {"value": "Obtuse", "label": "Obtuse"},
        {"value": "Right", "label": "Right"},
        {"value": "Straight", "label": "Straight"}
    ])
    return {
        "type": "mcq",
        "question": "Identify the type of angle shown in the image",
        "topic": "Geometry / Angles",
        "options": options,
        "answer": a_type,
        "image": image_path
    }

def generate_triangles():
    types = ["Equilateral", "Isosceles", "Scalene"]
    t_type = random.choice(types)
    image_num = get_random_int(1, 2)
    image_path = f"/assets/grade4/triangle_{t_type.lower()}_{image_num}.svg"
    
    options = shuffle_array([
        {"value": "Equilateral", "label": "Equilateral"},
        {"value": "Isosceles", "label": "Isosceles"},
        {"value": "Scalene", "label": "Scalene"},
        {"value": "Right Angled", "label": "Right Angled"}
    ])
    return {
        "type": "mcq",
        "question": "Identify the type of triangle based on the side lengths shown in the image:",
        "topic": "Geometry / Triangles",
        "options": options,
        "answer": t_type,
        "image": image_path
    }

# --- Measurement ---

def generate_area_shape():
    shape_type = get_random_int(0, 1) # 0 = rectangle, 1 = square
    if shape_type == 0:
        l = get_random_int(2, 10)
        b = get_random_int(2, 10)
        area = l * b
        width, height = 300, 250
        max_dim = max(l, b)
        scale = 150 / max_dim
        rect_width = l * scale
        rect_height = b * scale
        rect_x = (width - rect_width) / 2
        rect_y = (height - rect_height) / 2
        
        svg_parts = [
            f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">',
            '<rect width="100%" height="100%" fill="white" />',
            f'<rect x="{rect_x}" y="{rect_y}" width="{rect_width}" height="{rect_height}" fill="#a8dadc" stroke="#1d3557" stroke-width="3"/>',
            f'<text x="{rect_x + rect_width / 2}" y="{rect_y - 10}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">{l}cm</text>',
            f'<text x="{rect_x + rect_width + 20}" y="{rect_y + rect_height / 2}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">{b}cm</text>',
            '</svg>'
        ]
        svg_string = ''.join(svg_parts)
        base64_svg = base64.b64encode(svg_string.encode()).decode()
        image_path = f"data:image/svg+xml;base64,{base64_svg}"
        
        return {
            "type": "userInput",
            "topic": "Measurement / Area",
            "question": "Find the area of the rectangle shown in the image:",
            "answer": str(area),
            "image": image_path
        }
    else:
        side = get_random_int(2, 10)
        area = side * side
        width, height = 300, 250
        square_size = 150
        square_x = (width - square_size) / 2
        square_y = (height - square_size) / 2
        
        svg_parts = [
            f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">',
            '<rect width="100%" height="100%" fill="white" />',
            f'<rect x="{square_x}" y="{square_y}" width="{square_size}" height="{square_size}" fill="#f4a261" stroke="#1d3557" stroke-width="3"/>',
            f'<text x="{square_x + square_size / 2}" y="{square_y - 10}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">{side}cm</text>',
            f'<text x="{square_x + square_size + 20}" y="{square_y + square_size / 2}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">{side}cm</text>',
            '</svg>'
        ]
        svg_string = ''.join(svg_parts)
        base64_svg = base64.b64encode(svg_string.encode()).decode()
        image_path = f"data:image/svg+xml;base64,{base64_svg}"
        
        return {
            "type": "userInput",
            "topic": "Measurement / Area",
            "question": "Find the area of the square shown in the image:",
            "answer": str(area),
            "image": image_path
        }

def generate_perimeter_shape():
    shape_type = get_random_int(0, 1) # 0 = rectangle, 1 = square
    if shape_type == 0:
        l = get_random_int(2, 10)
        b = get_random_int(2, 10)
        perimeter = 2 * (l + b)
        width, height = 300, 250
        max_dim = max(l, b)
        scale = 150 / max_dim
        rect_width = l * scale
        rect_height = b * scale
        rect_x = (width - rect_width) / 2
        rect_y = (height - rect_height) / 2
        
        svg_parts = [
            f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">',
            '<rect width="100%" height="100%" fill="white" />',
            f'<rect x="{rect_x}" y="{rect_y}" width="{rect_width}" height="{rect_height}" fill="#a8dadc" stroke="#1d3557" stroke-width="3"/>',
            f'<text x="{rect_x + rect_width / 2}" y="{rect_y - 10}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">{l}cm</text>',
            f'<text x="{rect_x + rect_width + 20}" y="{rect_y + rect_height / 2}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">{b}cm</text>',
            '</svg>'
        ]
        svg_string = ''.join(svg_parts)
        base64_svg = base64.b64encode(svg_string.encode()).decode()
        image_path = f"data:image/svg+xml;base64,{base64_svg}"
        
        return {
            "type": "userInput",
            "topic": "Measurement / Perimeter",
            "question": "Find the perimeter of the rectangle shown in the image:",
            "answer": str(perimeter),
            "image": image_path
        }
    else:
        side = get_random_int(2, 10)
        perimeter = 4 * side
        width, height = 300, 250
        square_size = 150
        square_x = (width - square_size) / 2
        square_y = (height - square_size) / 2
        
        svg_parts = [
            f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">',
            '<rect width="100%" height="100%" fill="white" />',
            f'<rect x="{square_x}" y="{square_y}" width="{square_size}" height="{square_size}" fill="#f4a261" stroke="#1d3557" stroke-width="3"/>',
            f'<text x="{square_x + square_size / 2}" y="{square_y - 10}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">{side}cm</text>',
            f'<text x="{square_x + square_size + 20}" y="{square_y + square_size / 2}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">{side}cm</text>',
            '</svg>'
        ]
        svg_string = ''.join(svg_parts)
        base64_svg = base64.b64encode(svg_string.encode()).decode()
        image_path = f"data:image/svg+xml;base64,{base64_svg}"
        
        return {
            "type": "userInput",
            "topic": "Measurement / Perimeter",
            "question": "Find the perimeter of the square shown in the image:",
            "answer": str(perimeter),
            "image": image_path
        }

def generate_measurement_conversion():
    types = ["Time", "Capacity", "Length", "Mass"]
    m_type = random.choice(types)
    if m_type == "Time":
        hours = get_random_int(2, 10)
        minutes = hours * 60
        question = f"Convert {hours} hours to minutes."
        topic = "Measurement / Time"
        answer = str(minutes)
    elif m_type == "Capacity":
        liters = get_random_int(2, 9)
        ml = liters * 1000
        question = f"Convert {liters} liters to milliliters."
        topic = "Measurement / Capacity"
        answer = str(ml)
    elif m_type == "Length":
        meters = get_random_int(2, 9)
        cm = meters * 100
        question = f"Convert {cm} centimeters to meters."
        topic = "Measurement / Length"
        answer = str(meters)
    else:
        kg = get_random_int(2, 9)
        g = kg * 1000
        question = f"Convert {kg} kg to grams."
        topic = "Measurement / Mass"
        answer = str(g)
    return {
        "type": "userInput",
        "question": question,
        "topic": topic,
        "answer": answer
    }

def generate_measurement_conversion_application():
    types = ["Time", "Capacity", "Length", "Mass"]
    m_type = random.choice(types)
    if m_type == "Time":
        hours = get_random_int(1, 5)
        minutes = hours * 60
        scenarios = [
            f"You studied for {hours} hours. How many minutes did you study?",
            f"A movie lasts {hours} hours. How many minutes long is it?",
            f"You played outside for {hours} hours. How many minutes is that?",
            f"Your class picnic lasted {hours} hours. Convert it into minutes.",
            f"You watched cartoons for {hours} hours. How many minutes did you watch?"
        ]
        question = random.choice(scenarios)
        topic = "Measurement / Time"
        answer = str(minutes)
    elif m_type == "Capacity":
        liters = get_random_int(1, 5)
        ml = liters * 1000
        scenarios = [
            f"A bottle holds {liters} liters of juice. How many milliliters is that?",
            f"Your mother bought {liters} liters of milk. Convert it to milliliters.",
            f"A water jug contains {liters} liters of water. How many milliliters does it hold?",
            f"A lemonade jar has {liters} liters of lemonade. Convert to milliliters.",
            f"A tank stores {liters} liters of water. How many milliliters is that?"
        ]
        question = random.choice(scenarios)
        topic = "Measurement / Capacity"
        answer = str(ml)
    elif m_type == "Length":
        meters = get_random_int(1, 5)
        cm = meters * 100
        scenarios = [
            f"A rope is {cm} centimeters long. How many meters is that?",
            f"Your table is {cm} centimeters long. Convert it into meters.",
            f"A jump rope measures {cm} centimeters. How many meters long is it?",
            f"A ribbon is {cm} centimeters long. Convert to meters.",
            f"A bench is {cm} centimeters long. How many meters is that?"
        ]
        question = random.choice(scenarios)
        topic = "Measurement / Length"
        answer = str(meters)
    else:
        kg = get_random_int(1, 5)
        g = kg * 1000
        scenarios = [
            f"A bag of rice weighs {kg} kilograms. How many grams is that?",
            f"You bought a {kg}-kilogram packet of sugar. Convert it to grams.",
            f"A puppy weighs {kg} kilograms. How many grams does it weigh?",
            f"A watermelon weighs {kg} kilograms. Convert its weight to grams.",
            f"Your school bag weighs {kg} kilograms. How many grams is that?"
        ]
        question = random.choice(scenarios)
        topic = "Measurement / Mass"
        answer = str(g)
    return {
        "type": "userInput",
        "topic": topic,
        "question": question,
        "answer": answer
    }

def generate_time_conversion_5to10():
    hours = get_random_int(5, 10)
    minutes = hours * 60
    return {
        "type": "userInput",
        "question": f"Convert {hours} hours to minutes.",
        "topic": "Measurement / Time",
        "answer": str(minutes)
    }

# --- Data Handling ---

def generate_bar_graph():
    apples = get_random_int(10, 50)
    oranges = get_random_int(10, 50)
    bananas = get_random_int(10, 50)
    while apples == oranges or oranges == bananas or apples == bananas:
        apples = get_random_int(10, 50)
        oranges = get_random_int(10, 50)
        bananas = get_random_int(10, 50)
    
    max_val = max(apples, oranges, bananas)
    y_axis_max = math.ceil(max_val / 10) * 10 + 10
    
    if max_val == apples: answer = "Apples"
    elif max_val == oranges: answer = "Oranges"
    else: answer = "Bananas"
    
    width, height = 400, 300
    padding = 50
    chart_width = width - 2 * padding
    chart_height = height - 2 * padding
    bar_width = 60
    gap = (chart_width - (3 * bar_width)) / 4
    
    def get_y(val):
        return height - padding - (val / y_axis_max) * chart_height
    
    svg_parts = [
        f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">',
        '<rect width="100%" height="100%" fill="white" />',
        f'<line x1="{padding}" y1="{height - padding}" x2="{width - padding}" y2="{height - padding}" stroke="black" stroke-width="2"/>',
        f'<line x1="{padding}" y1="{height - padding}" x2="{padding}" y2="{padding}" stroke="black" stroke-width="2"/>'
    ]
    
    for i in range(0, y_axis_max + 1, 10):
        y = get_y(i)
        svg_parts.append(f'<line x1="{padding - 5}" y1="{y}" x2="{padding}" y2="{y}" stroke="black"/>')
        svg_parts.append(f'<text x="{padding - 10}" y="{y + 5}" font-family="Arial" font-size="12" text-anchor="end">{i}</text>')
        
    data = [
        {"label": "Apples", "value": apples, "color": "#ff6b6b"},
        {"label": "Oranges", "value": oranges, "color": "#ffa502"},
        {"label": "Bananas", "value": bananas, "color": "#ffeaa7"}
    ]
    
    for index, item in enumerate(data):
        x = padding + gap + (index * (bar_width + gap))
        y = get_y(item["value"])
        bar_h = (height - padding) - y
        svg_parts.append(f'<rect x="{x}" y="{y}" width="{bar_width}" height="{bar_h}" fill="{item["color"]}" stroke="black"/>')
        svg_parts.append(f'<text x="{x + bar_width / 2}" y="{y - 5}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">{item["value"]}</text>')
        svg_parts.append(f'<text x="{x + bar_width / 2}" y="{height - padding + 20}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">{item["label"]}</text>')
        
    svg_parts.append('</svg>')
    svg_string = ''.join(svg_parts)
    base64_svg = base64.b64encode(svg_string.encode()).decode()
    image_path = f"data:image/svg+xml;base64,{base64_svg}"
    
    options = shuffle_array([
        {"value": "Apples", "label": "Apples"},
        {"value": "Oranges", "label": "Oranges"},
        {"value": "Bananas", "label": "Bananas"},
        {"value": "Grapes", "label": "Grapes"}
    ])
    
    return {
        "type": "mcq",
        "question": "Look at the bar graph. Which fruit has the highest count?",
        "topic": "Data Handling / Bar Graph",
        "options": options,
        "answer": answer,
        "image": image_path
    }

# --- Logical Thinking ---

def generate_pattern():
    start = get_random_int(2, 5)
    mult = get_random_int(1, 3)
    seq = [start, start * mult]
    next_val = start * mult * mult
    return {
        "type": "userInput",
        "question": f"Complete the pattern: </br> {', '.join(map(str, seq))}, ?",
        "topic": "Logical Thinking / Patterns",
        "answer": str(next_val)
    }

def generate_simple_grade4_pattern():
    p_type = get_random_int(1, 3)
    if p_type == 1:
        start, step = get_random_int(2, 20), get_random_int(2, 10)
        seq = [start, start + step, start + step * 2]
        next_val = start + step * 3
    elif p_type == 2:
        start, step = get_random_int(30, 60), get_random_int(2, 10)
        seq = [start, start - step, start - step * 2]
        next_val = start - step * 3
    else:
        start, step = get_random_int(1, 5), get_random_int(2, 3)
        seq = [start, start * step, start * step * step]
        next_val = start * step * step * step
        
    return {
        "type": "userInput",
        "question": f"Complete the pattern: </br> {', '.join(map(str, seq))}, ?",
        "topic": "Number Patterns",
        "answer": str(next_val)
    }

def generate_3d_shape_identification():
    shapes = {
        'Triangular Prism': {'name': 'Triangular Prism', 'imagePath': '/assets/grade4/3d_shapes/triangular_prism.png'},
        'Square Prism': {'name': 'Square Prism', 'imagePath': '/assets/grade4/3d_shapes/square_prism.png'},
        'Hexagonal Prism': {'name': 'Hexagonal Prism', 'imagePath': '/assets/grade4/3d_shapes/hexagonal_prism.png'},
        'Triangular Pyramid': {'name': 'Triangular Pyramid', 'imagePath': '/assets/grade4/3d_shapes/triangular_pyramid.png'},
        'Square Pyramid': {'name': 'Square Pyramid', 'imagePath': '/assets/grade4/3d_shapes/square_pyramid.png'},
        'Pentagonal Pyramid': {'name': 'Pentagonal Pyramid', 'imagePath': '/assets/grade4/3d_shapes/pentagonal_pyramid.png'}
    }
    names = list(shapes.keys())
    selected_name = random.choice(names)
    selected_shape = shapes[selected_name]
    
    wrong_names = [n for n in names if n != selected_name]
    random.shuffle(wrong_names)
    wrong_answers = wrong_names[:3]
    
    options = shuffle_array([
        {"value": selected_name, "label": selected_name},
        {"value": wrong_answers[0], "label": wrong_answers[0]},
        {"value": wrong_answers[1], "label": wrong_answers[1]},
        {"value": wrong_answers[2], "label": wrong_answers[2]}
    ])
    
    return {
        "type": "mcq",
        "question": "Identify the 3D shape shown in the image:",
        "image": selected_shape['imagePath'],
        "topic": "Geometry / 3D Shapes",
        "options": options,
        "answer": selected_name
    }

def generate_fve_table():
    shapes = [
        {'name': 'Cube', 'image': '/assets/grade4/FVE/cube_square_Prism.png', 'faces': 6, 'vertices': 8, 'edges': 12},
        {'name': 'Cuboid', 'image': '/assets/grade4/FVE/cuboid_rectangular_Prism.png', 'faces': 6, 'vertices': 8, 'edges': 12},
        {'name': 'Triangular Pyramid', 'image': '/assets/grade4/FVE/triangular_Pyramid .png', 'faces': 4, 'vertices': 4, 'edges': 6},
        {'name': 'Square Pyramid', 'image': '/assets/grade4/FVE/square_pyramid .png', 'faces': 5, 'vertices': 5, 'edges': 8},
        {'name': 'Triangular Prism', 'image': '/assets/grade4/FVE/triangular_Prism .png', 'faces': 5, 'vertices': 6, 'edges': 9}
    ]
    random.shuffle(shapes)
    selected = shapes[:2]
    
    import json
    answer = {}
    for i, s in enumerate(selected):
        answer[str(i)] = {"faces": s['faces'], "vertices": s['vertices'], "edges": s['edges']}
        
    rows = [{"text": s['name'], "image": s['image']} for s in selected]
    
    return {
        "type": "tableInput",
        "variant": "triple-input",
        "question": "",
        "topic": "Geometry / 3D Shapes - Faces, Vertices, Edges",
        "headers": ["Shapes", "Number of faces (F)", "Number of vertices (V)", "Number of edges (E)"],
        "inputKeys": ["faces", "vertices", "edges"],
        "placeholders": ["", "", ""],
        "rows": rows,
        "answer": json.dumps(answer)
    }

GRADE4_GENERATORS = {
    "Number Sense / Place Value": generate_place_value_5digit,
    "Number Sense / Place Value Visual": generate_place_value_5digit_visual,
    "Number Sense / Expanded Form": generate_expanded_form,
    "Addition / With Carry": generate_addition_4digit,
    "Addition / With Carry Application": generate_addition_4digit_application,
    "Subtraction / With Borrow": generate_subtraction_4digit,
    "Subtraction / With Borrow Application": generate_subtraction_4digit_application,
    "Number Sense / Multiplication": generate_multiplication,
    "Multiplication / 2-digit × 2-digit": generate_multiplication_application,
    "Number Sense / Division": generate_division,
    "Division / 3-digit ÷ 1-digit": generate_division_application,
    "Number Sense / Estimation": generate_estimation,
    "Number Sense / LCM": generate_lcm,
    "Fractions / Types": generate_proper_improper_fractions,
    "Fractions / Types Mixed": generate_mixed_unit_fractions,
    "Fractions / Operations": generate_fraction_operations,
    "Geometry / Angles": generate_angles,
    "Geometry / Triangles": generate_triangles,
    "Measurement / Area": generate_area_shape,
    "Measurement / Perimeter": generate_perimeter_shape,
    "Measurement / Conversion": generate_measurement_conversion,
    "Measurement / Conversion Application": generate_measurement_conversion_application,
    "Measurement / Time": generate_time_conversion_5to10,
    "Data Handling / Bar Graph": generate_bar_graph,
    "Logical Thinking / Patterns": generate_pattern,
    "Number Patterns": generate_simple_grade4_pattern,
    "Geometry / 3D Shapes": generate_3d_shape_identification,
    "Geometry / 3D Shapes - FVE": generate_fve_table
}
