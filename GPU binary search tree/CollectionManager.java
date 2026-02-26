import java.io.*;
import java.util.*;
/*
Warsame Mahdi
2/19/2025
P2: Disaster Relief
TAs: Rohan Simon Shanthanu and Trien Vuong
This class is a Gpu Collection Manager. It is a binary search tree that
sorts gpus and allows users to add gpus, find gpus within a price range,
print out the tree and more.
 */
public
class CollectionManager {
   public
    GpuNode gpuRoot;

   public static class GpuNode {
       public final Gpu gpu;
       public GpuNode left;
       public GpuNode right;

        /*
        Behavior:
            Constructs a new Gpu node with no branches using the
            provided gpu.
        Parameters: 
            Gpu: the new root of this gpuRoot
        */
       public GpuNode(Gpu gpu) { 
            this(gpu, null, null); 
        }

        /*
        Behavior:
            Constructs a new Gpu node with with branches using the
            provided gpus.
        Parameters: 
            Gpu: the new root of this gpuRoot
            GpuNode: the new left branch of the gpuRoot
            GpuNode: the new Right branch of the gpuRoot
        */
       public GpuNode(Gpu gpu, GpuNode left, GpuNode right) {
            this.gpu = gpu;
            this.left = left;
            this.right = right;
        }

       /*
        Behavior:
            Constructs a new Gpu node based on the provuded gpuNode.
        Parameters:
            - GpuNode: The node we're copying.
        */
       public GpuNode(GpuNode toCopy) { 
            this.gpu = toCopy.gpu;
            this.left = toCopy.left;
            this.right = toCopy.right;
        }
       
       /*
       Behavior: 
            - Returns a Stirng representation of this gpuNodes gpu.
        Returns:
            - String: A Stirng representation of this gpuNodes gpu.
       */
       public String toString() { 
           return gpu.toString(); 
        }
    }

    /*
    Behavior:
        Creates a new empty gpu collection.
     */
    public CollectionManager() {
        this.gpuRoot = null;
    }

    /*
    Behavior:
        Loads a gpu collection from a file using a connected scanner. Maintains
        the order gpus appear in the file.
    Parameters:
        Scanner: A scanner connected to the file witth the gpu collection
                 we're copying. Cannot be null.
    Exceptions:
        IllegalArgumentException: if the provided scanner is null.
     */
   public CollectionManager(Scanner input) {
        if (input == null) {
            throw new IllegalArgumentException(
                "The provided Scanner cannot be null");
        }
        treeBuilder(input);
    }

    /*
    Behavior:
        Loads a gpu collection from a file using a connected scanner. Maintains
        the order gpus appear in the file.
    Parameters:
        Scanner: A scanner connected to the file witth the gpu collection
                 we're copying. Cannot be null.
    Exceptions:
        IllegalArgumentException: if the provided scanner is null.
     */
   private void treeBuilder(Scanner input) {
        if (input.hasNextLine()) {
            String name = input.nextLine().substring("Name: ".length());
            String str = input.nextLine();
            int memory = Integer.parseInt(
                str.substring("VRAM: ".length(), str.indexOf("G")));
            int year = Integer.parseInt(
                input.nextLine().substring("Year Made: ".length()));
            Double price = Double.parseDouble(
                input.nextLine().substring("Price: $".length()));
            input.nextLine();
            Gpu newGpu = new Gpu(name, memory, year, price);
            this.add(newGpu);
            treeBuilder(input);
        }
    }
    /*
        Behavior:
            - Makes a list of all gpus within the lower price range(Inclusive)
              and the upper price range(Inclusive). 
       Parameters: 
            - Scanner: To take in what price range the user wants to search for. 
       Returns: 
            - List<Gpu>: a list of every gpu found within the price range.
         */
   public List<Gpu> filter(Scanner input) {
        System.out.println("Enter lower price range: ");
        double min = Double.parseDouble(input.nextLine());
        System.out.println("Enter upper price range: ");
        double max = Double.parseDouble(input.nextLine());
        List<Gpu> found = new LinkedList<>();
        return filter(min, max, found, gpuRoot);
    }

    /*
    Behavior:
        - Makes a list of all gpus within the lower price range(Inclusive) and
          the upper price range(Inclusive). 
    Parameters: 
        - double: the minimum price of any found gpus. 
        - double: the maximum price of any found gpus. 
        - List<Gpu>: a list of every gpu found within the price range.
        GpuNode: the place within
    the tree we're currently evaluating. Returns: List<Gpu>: a list of every gpu
    found within the price range.
     */
   private List<Gpu> filter(double min, double max, List<Gpu> found, GpuNode root) {
        if (root == null) {
            return found;
        } else if (root.gpu.getPrice() <= max && root.gpu.getPrice() >= min) {
            found.add(root.gpu);
            filter(min, max, found, root.left);
            filter(min, max, found, root.right);
        } else if (root.gpu.getPrice() > max) {
            filter(min, max, found, root.left);
        } else if (root.gpu.getPrice() < min) {
            filter(min, max, found, root.right);
        }
        return found;
    }

    /*
    Behavior:
        Prints the String representation of every Gpu within the collection
        from least to greatest.
    Returns:
        String: the string representation of all gpus within this collection.
                sorted from least to greatest.
    */
   public String toString() {
        return toString(gpuRoot, ""); 
    }

    /*
   Behavior:
       Prints the String representation of every Gpu within the collection
       from least to greatest.
   Parameters:
       GpuRoot: the current place in the collection we're evaluating.
       String: our String representation of the collection so far.
   Returns:
       String: the string representation of all gpus within this collection.
               sorted from least to greatest.
   */
   private String toString(GpuNode root, String soFar) {
        if (root == null) {
            return soFar;
        }
        soFar += toString(root.left, "");
        soFar += root.gpu.toString() + "\n";
        soFar += toString(root.right, "");
        return soFar;
    }

    /*
    Behavior:
        - Saves this tree into a file.
    Parameters:
        PrintStream: A PrintStream connected to the file we put the tree in.
                     Cannot be null.
    Exceptions:
        - IllegalArgumentException - If the provided PrintStream is null.
     */
   public void save(PrintStream output) {
        if (output == null) {
            throw new IllegalArgumentException("The provided PrintStream cannot be null");
        }
        save(output, gpuRoot);
    }

    /*
    Behavior:
        - Saves this tree into a file.
    Parameters:
        - PrintStream: A PrintStream connected to the file we put the tree in.
                     Cannot be null.
        - GpuNode: the current node we're copying information into the file
    from. Exceptions:
        - IllegalArgumentException: If the provided PrintStream is null.
     */
   private void save(PrintStream output, GpuNode root) {
        if (root != null) {
            output.println(root.gpu.toString());
            save(output, root.left);
            save(output, root.right);
        }
    }

    /*
    Behavior:
        - adds the given gpu into the sorted collection, maintaining the order.
    Parameters:
        - Gpu: the gpu we're adding. Cannot be null.
    Exceptions:
        - IllegalArgumentException: If the provided gpu cannot be null.
     */
   public void add(Gpu gpu) {
        if (gpu == null) {
            throw new IllegalArgumentException("The provided gpu cannot be null.");
        }
        gpuRoot = add(gpu, gpuRoot);
    }

    /*
   Behavior:
       - adds the given gpu into the sorted collection, maintaining the order.
   Parameters:
       - Gpu: the gpu we're adding. Cannot be null.
       - GpuNode: the place we're currently evauluating within the collection.
   Exceptions:
       - IllegalArgumentException: If the provided gpu cannot be null.

    */
   public GpuNode add(Gpu gpu, GpuNode gpuRoot) {
        if (gpuRoot == null) {
            gpuRoot = new GpuNode(gpu);
        } else if (gpuRoot.gpu.compareTo(gpu) > 0) {
            gpuRoot.left = add(gpu, gpuRoot.left);
        } else if (gpuRoot.gpu.compareTo(gpu) < 0) {
            gpuRoot.right = add(gpu, gpuRoot.right);
        }
        return gpuRoot;
    }

    /*
    Behavior:
        - Returns true if the collection contains the provideed gpu,
          false if not.
    Parameters:
        - Gpu: the gpu we're looking for within the collection. Cannot
               be null
    Returns:
        - boolean: whether the collection contains the provided gpu or not.
    Exceptions:
        - IllegalArgumentException: if the provided gpu is null.
     */
   public boolean contains(Gpu gpu) {
        if (gpu == null) {
            throw new IllegalArgumentException("The provided gpu cannot be null.");
        }
        return contains(gpu, gpuRoot);
    }

    /*
    Behavior:
        - Returns true if the collection contains the provideed gpu,
          false if not.
    Parameters:
        - Gpu: the gpu we're looking for within the collection. Cannot
               be null
        - GpuNode: the place within the gpu collection we're currently
                   evaluating.
    Returns:
        - boolean: whether the collection contains the provided gpu or not.
    Exceptions:
        - IllegalArgumentException: if the provided gpu is null.
     */
   public boolean contains(Gpu gpu, GpuNode root) {
        if (root == null) {
            return false;
        } else if (root.gpu.equals(gpu)) {
            return true;
        } else if (root.gpu.compareTo(gpu) > 0) {
            return contains(gpu, root.left);
        } else {
            return contains(gpu, root.right);
        }
    }
}
