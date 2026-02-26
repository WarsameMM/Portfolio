import java.util.*;
/*
Warsame Mahdi
2/19/2025
P2: Disaster Relief
TAs: Rohan Simon Shanthanu and Trien Vuong
This class is a Gpu object. It has the user make or copies a Gpu with
its own name, VRAM amount, year made and price.
 */
public class Gpu implements Comparable<Gpu> {
    private String name;
    private int memory;
    private int year;
    private double price;

    /*
    Behavior:
        - Constructs a new gpu object using the provided name, memory
          year and price.
     */
    public Gpu(String name, int memory, int year, double price) {
        this.name = name;
        this.memory = memory;
        this.year = year;
        this.price = price;
    }

    /*
    Behavior:
        - Constructs a new gpu object by copying the given gpus parameters.
    */
    public Gpu(Gpu gpu) {
        this(gpu.name, gpu.memory, gpu.year, gpu.price);
    }

    /*
    Behavior:
        - Creates a string of all the importaint information about this
          gpu and returns it.
    Returns:
        - A String representation of this gpu.
    */
    public String toString() {
        String info = "Name: " + name + "\nVRAM: " + memory + "GB\nYear Made: " + year
            + "\nPrice: $" + price + "\n";
        return info;
    }

    /*
    Behavior:
        - Returns true if this gpu and the provided gpu equal to eachother,
          false if not.
    Returns:
        - boolean: whether the two gpus are equal or not.
     */
    public boolean equals(Gpu other) {
        return this.hashCode() == other.hashCode() && this.name.equals(other.name)
            && this.memory == other.memory && this.year == other.year && this.price == other.price;
    }

    /*
   Behavior:
       - Returns a unique hashcode based on information about this gpu.
   Returns:
       - int: the hashcode of this gpu.
    */
    public int hashCode() {
        return 31 * this.name.hashCode() + 31 * (this.memory) + 31 * (this.year)
            + 31 * ((int) price);
    }

    /*
    Behavior:
        - Returns the price of this gpu.
    Returns:
        double: the price of this gpu.
     */
    public double getPrice() {
        return this.price;
    }

    /*
   Behavior:
       - Asks the user for information on a gpu and returns a gpu
         based on their input.
   Parameters:
       Scanner: what we use to get the users input
   Returns:
       Gpu: the gpu constructed using the information the user provided.
    */
    public static Gpu parse(Scanner input) {
        System.out.println("Enter the name of the GPU: ");
        String name = input.nextLine();
        System.out.println("Enter the amount of VRAM: ");
        int memory = Integer.parseInt(input.nextLine());
        System.out.println("Enter the year the GPU was made: ");
        int year = Integer.parseInt(input.nextLine());
        System.out.println("Enter the price of the GPU: ");
        double price = Double.parseDouble(input.nextLine());
        return new Gpu(name, memory, year, price);
    }

    /*
    Behavior:
        - Compares this and the provided gpu and returns the difference.
    Parameters:
        Gpu: what we're comparing this gpu to.
    Returns:
        Gpu: the gpu constructed using the information the user provided.
     */
    public int compareTo(Gpu other) {
        if (this.equals(other)) {
            return 0;
        } else if (this.memory != other.memory) {
            return this.memory - other.memory;
        } else if (this.price != other.price) {
            return (int) (other.price - this.price);
        } else if (this.year != other.year) {
            return this.year - other.year;
        } else {
            return this.name.compareTo(other.name);
        }
    }
}
